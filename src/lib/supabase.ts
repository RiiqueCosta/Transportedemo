import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Aceita também a URL no formato .../rest/v1
url = url.replace(/\/rest\/v1\/?$/, '');
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const configured = Boolean(url && anonKey && !url.includes('example.com'));

export const supabase: SupabaseClient | null = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** true quando o app está ligado a um banco Supabase de verdade */
export const isSupabaseConfigured = configured;
