import { createClient } from '@supabase/supabase-js';

// Never fall back to http://localhost in production — Safari will block it from https:// pages ("Load failed").
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:54321' : '');
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env.DEV ? 'dummy_key' : '');

if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
    // eslint-disable-next-line no-console
    console.error(
        '[Autolitics] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables (Production), then Redeploy.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
