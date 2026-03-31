import { createClient } from '@supabase/supabase-js';

/** @param {string | undefined} jwt */
function jwtRole(jwt) {
    if (!jwt || typeof jwt !== 'string' || jwt === 'dummy_key' || !jwt.includes('.')) return null;
    try {
        const b64 = jwt.split('.')[1];
        const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(padded);
        return /** @type {{ role?: string }} */ (JSON.parse(json)).role ?? null;
    } catch {
        return null;
    }
}

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

if (jwtRole(supabaseAnonKey) === 'service_role') {
    // eslint-disable-next-line no-console
    console.error(
        '[Autolitics] VITE_SUPABASE_ANON_KEY is the service_role SECRET. Browsers must use the anon PUBLIC key only (Supabase → Project Settings → API → anon public). Replace the env var and redeploy. This also breaks DB writes and causes "Forbidden use of secret API key in browser".'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
