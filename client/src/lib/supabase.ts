import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are missing. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);
