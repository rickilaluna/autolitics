# Production deploy checklist

- **Build:** `npm run build` — output in `dist/`
- **Lint:** `npm run lint` — must pass with 0 warnings

## Environment (production)

Set these where you deploy (Vercel, Netlify, etc.) or in `.env.production`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

Copy from `.env.example` and replace with real values. Do not commit real keys.

## Deploy

- Serve the `dist/` folder as static files.
- Ensure the server routes all requests to `index.html` for client-side routing (SPA).
- Optional: run `npm run preview` locally to test the production build.
