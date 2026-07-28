import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_REF') || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn(
    '[RuralConnect AI] Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing or set to defaults in frontend/.env. Supabase Auth will not function until valid keys are set.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
