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

### Vercel vs Hostinger (or any traditional host)

These are **independent**:

- **Vercel** deploys from Git when the repo is connected. Preview URLs (`*.vercel.app`) always reflect the latest successful build there.
- **Hostinger** (shared hosting, `public_html`) does **not** update when you push to GitHub unless you use Hostinger’s own Git deploy or **upload files manually**.

If your **custom domain** (e.g. `studio.…`) uses **Hostinger DNS** or points at Hostinger’s server, visitors see whatever is in **`public_html`** — often an **older** `npm run build` output until you upload a fresh `dist/` again.

**To use only Vercel for production:** In your DNS provider, point the domain to Vercel (see Vercel → Project → Domains for the correct CNAME/A records).

**To stay on Hostinger:** After each release, run `npm run build` locally (with production env) and upload **the contents of `dist/`** into the site root (or your app subfolder), replacing old `index.html` and `assets/*`. Ensure `.htaccess` or equivalent rewrites all routes to `index.html` for the SPA (see `public/.htaccess` in this repo if applicable).
