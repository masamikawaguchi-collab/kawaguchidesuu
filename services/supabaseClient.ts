import { createClient } from '@supabase/supabase-js';

// Supabaseの環境変数
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'missing'}`
  );
}

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
