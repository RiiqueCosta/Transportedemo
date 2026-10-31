import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User, Route, ShieldCheck, FileText, Smartphone } from 'lucide-react';
import { Logo } from './Logo';
import type { Role } from '../types';
import { ROLE_LABEL } from '../lib/permissions';
import { cn } from '../lib/utils';

type Mode = 'signin' | 'signup' | 'reset';

interface LoginViewProps {
  isDemo: boolean;
  onSignIn: (email: string, password: string, demoRole?: Role) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<'confirm_email' | 'ok'>;
  onReset: (email: string) => Promise<void>;
}

const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-brand/60 focus:border-brand outline-none transition';

export function LoginView({ isDemo, onSignIn, onSignUp, onReset }: LoginViewProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoRole, setDemoRole] = useState<Role>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signin') {
        await onSignIn(email.trim(), password, demoRole);
      } else if (mode === 'signup') {
        const res = await onSignUp(email.trim(), password, name.trim());
        if (res === 'confirm_email') {
          setInfo('Cadastro feito! Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, volte aqui e entre.');
          setMode('signin');
        }
      } else {
        await onReset(email.trim());
        setInfo('Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err?.message || 'Algo deu errado. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 app-bg flex">
      {/* Lado da marca (só em telas grandes) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-zinc-200 dark:border-zinc-800/80 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, transparent 0 46px, #6D4AFF 46px 48px, transparent 48px 96px)',
          }}
        />
        <Logo />
        <div className="relative max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900 dark:text-white">
            Cada frete,
            <br />
            do orçamento
            <br />
            <span className="text-brand dark:text-brand-light">à entrega.</span>
          </h1>
          <p className="mt-5 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            Clientes, frota, motoristas, contratos e financeiro da sua transportadora num só lugar, no computador ou no celular.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { icon: Route, t: 'Fretes e rotas', d: 'Do agendamento à entrega' },
              { icon: FileText, t: 'PDF com sua marca', d: 'Orçamentos e contratos' },
              { icon: ShieldCheck, t: 'Acessos por função', d: 'Admin, operador e motorista' },
              { icon: Smartphone, t: 'Feito para o celular', d: 'Motorista atualiza na estrada' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand dark:text-brand-light flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t}</p>
                  <p className="text-xs text-zinc-500">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-zinc-400">© {new Date().getFullYear()} Cargova</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Recuperar senha'}
          </h2>
          <p className="text-sm text-zinc-500 mt-1 mb-7">
            {mode === 'signin' && 'Acesse o painel da sua transportadora.'}
            {mode === 'signup' && 'Novos usuários precisam ser liberados por um administrador.'}
            {mode === 'reset' && 'Digite seu e-mail para receber o link.'}
          </p>

          {isDemo && (
            <div className="mb-5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              <b>Modo demonstração:</b> qualquer e-mail e senha funcionam, e os dados ficam só neste navegador.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <Field icon={User} label="Nome">
                <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Seu nome" />
              </Field>
            )}
            <Field icon={Mail} label="E-mail">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="voce@empresa.com.br"
              />
            </Field>
            {mode !== 'reset' && (
              <Field icon={Lock} label="Senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Mínimo 6 caracteres"
                />
              </Field>
            )}

            {isDemo && mode === 'signin' && (
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1.5">Entrar como</p>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {(['admin', 'operador', 'motorista'] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setDemoRole(r)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-semibold transition cursor-pointer',
                        demoRole === r
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
                      )}
                    >
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isDemo && (
            <div className="mt-6 flex flex-col gap-2 text-sm text-center">
              {mode === 'signin' ? (
                <>
                  <button onClick={() => switchMode('signup')} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                    Não tem conta? <span className="text-brand dark:text-brand-light font-semibold">Cadastre-se</span>
                  </button>
                  <button onClick={() => switchMode('reset')} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer">
                    Esqueci minha senha
                  </button>
                </>
              ) : (
                <button onClick={() => switchMode('signin')} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
                  Já tem conta? <span className="text-brand dark:text-brand-light font-semibold">Entrar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-500 mb-1.5">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        {children}
      </span>
    </label>
  );
}
