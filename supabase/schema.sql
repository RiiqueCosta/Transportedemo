-- =====================================================================
-- Cargova — esquema do banco de dados (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor de um projeto Supabase novo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfis de usuário (1 por conta do Supabase Auth)
-- Papéis: admin (tudo), operador (operação, sem financeiro/config),
--         motorista (só as próprias viagens)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'operador'
              check (role in ('admin', 'operador', 'motorista')),
  approved    boolean not null default false,
  driver_id   text,               -- id do registro de motorista vinculado
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Registros do sistema (clientes, veículos, frota, motoristas,
-- solicitações, contratos, financeiro) em um formato flexível
-- ---------------------------------------------------------------------
create table if not exists public.records (
  id          text primary key,
  type        text not null check (type in (
                'client','vehicle_transported','fleet','driver',
                'transport_request','contract','finance')),
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id) default auth.uid(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);
create index if not exists records_type_idx on public.records(type);
create index if not exists records_driver_idx
  on public.records ((data->>'driverId')) where type = 'transport_request';

-- Configurações da empresa (linha única)
create table if not exists public.settings (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
-- Funções auxiliares (security definer evita recursão no RLS)
-- ---------------------------------------------------------------------
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and approved
$$;

create or replace function public.my_driver_id()
returns text language sql stable security definer set search_path = public as $$
  select driver_id from public.profiles where id = auth.uid() and approved
$$;

-- Cria o perfil quando alguém se cadastra.
-- O PRIMEIRO usuário vira administrador aprovado automaticamente.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profiles) into is_first;
  insert into public.profiles (id, email, name, role, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when is_first then 'admin' else 'operador' end,
    is_first
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Marca quem alterou e quando
create or replace function public.touch_record()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists records_touch on public.records;
create trigger records_touch before update on public.records
  for each row execute function public.touch_record();

-- Motorista só pode mudar o STATUS da própria viagem
create or replace function public.driver_update_status(record_id text, new_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if new_status not in ('collected', 'in_transit', 'delivered') then
    raise exception 'Status inválido';
  end if;
  update public.records
     set data = jsonb_set(data, '{status}', to_jsonb(new_status))
   where id = record_id
     and type = 'transport_request'
     and data->>'driverId' = public.my_driver_id()
     and public.my_role() = 'motorista';
  if not found then
    raise exception 'Viagem não encontrada ou sem permissão';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Segurança (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.records  enable row level security;
alter table public.settings enable row level security;

-- profiles: cada um vê o próprio; admin vê e gerencia todos
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.my_role() = 'admin');

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles for delete to authenticated
  using (public.my_role() = 'admin' and id <> auth.uid());

-- records: leitura
drop policy if exists records_select on public.records;
create policy records_select on public.records for select to authenticated
  using (
    public.my_role() = 'admin'
    or (public.my_role() = 'operador' and type <> 'finance')
    or (public.my_role() = 'motorista'
        and type = 'transport_request'
        and data->>'driverId' = public.my_driver_id())
  );

-- records: escrita (admin tudo; operador tudo menos financeiro)
drop policy if exists records_insert on public.records;
create policy records_insert on public.records for insert to authenticated
  with check (
    public.my_role() = 'admin'
    or (public.my_role() = 'operador' and type <> 'finance')
  );

drop policy if exists records_update on public.records;
create policy records_update on public.records for update to authenticated
  using (
    public.my_role() = 'admin'
    or (public.my_role() = 'operador' and type <> 'finance')
  )
  with check (
    public.my_role() = 'admin'
    or (public.my_role() = 'operador' and type <> 'finance')
  );

drop policy if exists records_delete on public.records;
create policy records_delete on public.records for delete to authenticated
  using (public.my_role() = 'admin');

-- settings: todos aprovados leem; só admin altera
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated
  using (public.my_role() is not null);

drop policy if exists settings_update on public.settings;
create policy settings_update on public.settings for update to authenticated
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Permissões das funções
revoke all on function public.driver_update_status(text, text) from public, anon;
grant execute on function public.driver_update_status(text, text) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Tempo real (atualiza as telas automaticamente)
do $$ begin
  alter publication supabase_realtime add table public.records;
exception when others then null; end $$;
