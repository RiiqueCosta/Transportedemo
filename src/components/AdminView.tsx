import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, Trash2, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ROLE_LABEL } from '../lib/permissions';
import type { Driver, Profile, Role } from '../types';
import { Avatar } from './Navigation';
import { cn } from '../lib/utils';

interface AdminViewProps {
  me: Profile;
  drivers: Driver[];
}

const selectCls =
  'px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-brand/50 outline-none';

export function AdminView({ me, drivers }: AdminViewProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at');
    if (error) setError(error.message);
    setUsers(
      (data || []).map((r: any) => ({
        id: r.id,
        email: r.email,
        name: r.name || r.email,
        role: r.role,
        approved: r.approved,
        driverId: r.driver_id,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, changes: Record<string, unknown>) => {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').update(changes).eq('id', id);
    if (error) alert('Erro: ' + error.message);
    load();
  };

  const remove = async (u: Profile) => {
    if (!supabase || !confirm(`Remover o acesso de ${u.email}?`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', u.id);
    if (error) alert('Erro: ' + error.message);
    load();
  };

  if (!supabase) {
    return (
      <div className="max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
        <ShieldCheck className="w-10 h-10 text-brand mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Usuários e acessos</h2>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          No modo demonstração não há contas de verdade. Quando o sistema estiver ligado ao banco de dados, cada pessoa cria a própria conta e
          aparece aqui para você liberar e escolher a função: <b>Administrador</b> (tudo), <b>Operador</b> (operação, sem financeiro e
          configurações) ou <b>Motorista</b> (só vê e atualiza as próprias viagens).
        </p>
      </div>
    );
  }

  const pending = users.filter((u) => !u.approved);
  const active = users.filter((u) => u.approved);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Usuários e acessos</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Novas contas aparecem aqui para aprovação. Motoristas precisam ser vinculados ao cadastro de motorista para ver as viagens.
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer" title="Atualizar">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 text-sm text-red-500">{error}</div>}

      {pending.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
          <h3 className="px-5 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 border-b border-amber-500/20">
            <Clock className="w-4 h-4" /> Aguardando aprovação ({pending.length})
          </h3>
          <div className="divide-y divide-amber-500/10">
            {pending.map((u) => (
              <UserRow key={u.id} u={u} me={me} drivers={drivers} onUpdate={update} onRemove={remove} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <h3 className="px-5 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800">
          Com acesso ({active.length})
        </h3>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {active.map((u) => (
            <UserRow key={u.id} u={u} me={me} drivers={drivers} onUpdate={update} onRemove={remove} />
          ))}
          {!loading && active.length === 0 && <p className="p-5 text-sm text-zinc-500">Ninguém por aqui ainda.</p>}
        </div>
      </section>
    </div>
  );
}

function UserRow({
  u,
  me,
  drivers,
  onUpdate,
  onRemove,
}: {
  u: Profile;
  me: Profile;
  drivers: Driver[];
  onUpdate: (id: string, changes: Record<string, unknown>) => void;
  onRemove: (u: Profile) => void;
}) {
  const isMe = u.id === me.id;
  return (
    <div className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={u.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {u.name} {isMe && <span className="text-xs font-normal text-zinc-400">(você)</span>}
          </p>
          <p className="text-xs text-zinc-500 truncate">{u.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={u.role}
          disabled={isMe}
          onChange={(e) => onUpdate(u.id, { role: e.target.value as Role })}
          className={selectCls}
        >
          {(['admin', 'operador', 'motorista'] as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>

        {u.role === 'motorista' && (
          <select
            value={u.driverId || ''}
            onChange={(e) => onUpdate(u.id, { driver_id: e.target.value || null })}
            className={selectCls}
          >
            <option value="">Vincular ao motorista…</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {!u.approved && (
          <button
            onClick={() => onUpdate(u.id, { approved: true })}
            className="px-3 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Aprovar
          </button>
        )}
        {u.approved && !isMe && (
          <button
            onClick={() => onUpdate(u.id, { approved: false })}
            className="px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Bloquear
          </button>
        )}
        {!isMe && (
          <button onClick={() => onRemove(u)} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer" title="Remover">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
