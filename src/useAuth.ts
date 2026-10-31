import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Profile, Role } from './types';

const DEMO_KEY = 'cargova_demo_user';

type Status = 'loading' | 'signed_out' | 'signed_in';

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email?.split('@')[0] || 'Usuário',
    role: row.role,
    approved: row.approved,
    driverId: row.driver_id,
  };
}

/**
 * Login. Com Supabase configurado usa o Supabase Auth (e-mail e senha).
 * Sem Supabase, funciona em "modo demonstração" (dados só neste navegador).
 */
export function useAuth() {
  const [status, setStatus] = useState<Status>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    // O perfil é criado por um gatilho no banco logo após o cadastro;
    // tenta algumas vezes caso ainda não exista.
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        setProfile(mapProfile(data));
        setStatus('signed_in');
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
    }
    // Conta sem perfil (ex.: acesso removido pelo admin): encerra a sessão
    await supabase.auth.signOut();
    setProfile(null);
    setStatus('signed_out');
  }, []);

  useEffect(() => {
    if (!supabase) {
      try {
        const saved = localStorage.getItem(DEMO_KEY);
        if (saved) {
          setProfile(JSON.parse(saved));
          setStatus('signed_in');
          return;
        }
      } catch {
        /* ignora */
      }
      setStatus('signed_out');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadProfile(data.session.user.id);
      else setStatus('signed_out');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null);
        setStatus('signed_out');
      } else if (event === 'SIGNED_IN') {
        loadProfile(session.user.id);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string, demoRole: Role = 'admin') => {
    if (!supabase) {
      const demo: Profile = {
        id: 'demo-' + demoRole,
        email,
        name: email.split('@')[0],
        role: demoRole,
        approved: true,
        driverId: null,
      };
      localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
      setProfile(demo);
      setStatus('signed_in');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signUp = async (email: string, password: string, name: string): Promise<'confirm_email' | 'ok'> => {
    if (!supabase) {
      await signIn(email, password);
      return 'ok';
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    if (error) throw new Error(translateAuthError(error.message));
    return data.session ? 'ok' : 'confirm_email';
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem(DEMO_KEY);
      setProfile(null);
      setStatus('signed_out');
      return;
    }
    await supabase.auth.signOut();
  };

  return {
    status,
    profile,
    isDemo: !isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (m.includes('already registered')) return 'Este e-mail já tem cadastro. Use "Entrar".';
  if (m.includes('password')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
  return msg;
}
