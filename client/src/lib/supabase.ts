import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://obvrirdhqnwjmfaiqfki.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idnJpcmRocW53am1mYWlxZmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDgxMzIsImV4cCI6MjA4MzI4NDEzMn0.YQZdQLH6SP01T__3Ckw6CMD31I4fSLNkW3sWk5hWqx0';

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Using fallback Supabase credentials. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);
