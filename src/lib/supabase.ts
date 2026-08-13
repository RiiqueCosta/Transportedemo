/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();

// Normalize URL in case user provided rest endpoint format
if (rawUrl.endsWith('/rest/v1/')) {
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
} else if (rawUrl.endsWith('/rest/v1')) {
  rawUrl = rawUrl.replace(/\/rest\/v1$/, '');
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

// Detect if keys are still default placeholders or empty
const isPlaceholder = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseAnonKey === 'your-anon-key' || 
  supabaseUrl.includes('example.com');

export const supabase = isPlaceholder 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  return !isPlaceholder;
}

export function getSupabaseUrl(): string {
  return supabaseUrl;
}
