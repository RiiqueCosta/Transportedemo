/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

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
