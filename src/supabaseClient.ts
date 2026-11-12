import { createClient, SupabaseClient } from '@supabase/supabase-js';

let rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Bersihkan jika ada akhiran /rest/v1/ atau garis miring berlebih
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  supabaseAnonKey &&
  rawUrl !== 'https://your-project.supabase.co' &&
  !rawUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, supabaseAnonKey)
  : null;
