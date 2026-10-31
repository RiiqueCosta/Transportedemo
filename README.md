# Cargova

Sistema de gestão para transportadoras de veículos: solicitações de frete, clientes, veículos transportados, frota, motoristas, contratos, financeiro e relatórios. Funciona no computador e no celular.

## Funções

- **Fretes do orçamento à entrega**: calculadora de frete, status (agendado → coletado → em trânsito → entregue) e **orçamento em PDF** com a marca da empresa.
- **Contratos em PDF**, com cláusulas e campos de assinatura.
- **Login real** (Supabase Auth) com **papéis**:
  - **Administrador**: acesso total, aprova usuários, financeiro e configurações.
  - **Operador**: toda a operação, sem financeiro, relatórios ou configurações, e sem excluir registros.
  - **Motorista**: tela "Minhas viagens" no celular, com rota no Google Maps e botões para confirmar coleta, início e entrega.
- Dados na nuvem com **atualização em tempo real** entre usuários.
- Tema escuro (padrão) e claro.

## Modo demonstração

Sem as variáveis do Supabase, o app roda em **modo demonstração**: qualquer e-mail/senha entra, dá para escolher o papel na tela de login, e os dados ficam salvos só no navegador.

## Ligar ao Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. No **SQL Editor**, rode todo o arquivo [`supabase/schema.sql`](supabase/schema.sql).
3. Configure as variáveis (localmente em `.env.local`, e na Vercel em *Settings → Environment Variables*):
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```
4. Em *Authentication → URL Configuration*, coloque a URL do site publicado em **Site URL**.
5. Crie a primeira conta pelo app: **o primeiro usuário vira administrador automaticamente**. Os seguintes precisam ser aprovados em *Usuários e acessos*.

## Rodar localmente

```bash
npm install
npm run dev
```

## Tecnologias

React 19, Vite, Tailwind CSS, Supabase (Postgres, Auth, Realtime, RLS), Recharts e html2pdf.js. Publicação na Vercel (`vercel.json` incluso).
