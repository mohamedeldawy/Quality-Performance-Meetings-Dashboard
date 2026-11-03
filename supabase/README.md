# Supabase + GitHub Pages

This deployment uses GitHub Pages for the React frontend and a Supabase Edge Function for authentication and shared data. Render is not used.

## Database

Run `schema.sql` in the Supabase SQL Editor.

## Edge Function environment secrets

In Supabase Dashboard → Project Settings → Edge Functions → Secrets, configure `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SESSION_SECRET`, `INITIAL_ADMIN_USERNAME`, `INITIAL_ADMIN_NAME`, and `INITIAL_ADMIN_PASSWORD`.

Use the project URL `https://gexpautvhgwscujyhdhr.supabase.co`, username `Dawy`, and display name `Mohamed Eldawy`. Set a new private password of at least 12 characters. Use the random session secret already generated locally. Never put the Secret key, session secret, or admin password in GitHub source or browser variables.

## Deploy function

Install the Supabase CLI and run:

```bash
supabase login
supabase link --project-ref gexpautvhgwscujyhdhr
supabase functions deploy dashboard --no-verify-jwt
```

The function uses custom random session tokens, so `supabase/config.toml` disables gateway JWT verification for this function. Passwords are stored as PBKDF2-SHA-256 hashes.

## GitHub Pages

In GitHub → Settings → Secrets and variables → Actions → Variables, add:

- `VITE_SUPABASE_URL` = `https://gexpautvhgwscujyhdhr.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the project's Publishable key

Then open Settings → Pages and select GitHub Actions. The workflow deploys only from `supabase-live-sync`; it does not deploy `main`.

## Notes

The first login creates the manager account and initializes sample member/meeting data only when the tables are empty. Manager-only actions are checked by the Edge Function. Concurrent dashboard updates use a version check to avoid silently overwriting newer changes. Large images and PDFs are currently stored inside dashboard JSON data; moving them to Supabase Storage is recommended before using large uploads.
