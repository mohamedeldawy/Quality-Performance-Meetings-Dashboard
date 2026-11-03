# Supabase setup

1. Open the Supabase project SQL Editor.
2. Run the complete contents of `schema.sql`. This creates the private user/session tables and secures all dashboard tables with RLS.
3. In the Render web service, add these environment variables (never commit their values to GitHub):

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Supabase Secret key (server-side only) |
| `SESSION_SECRET` | A long random secret, at least 32 characters |
| `INITIAL_ADMIN_USERNAME` | `Dawy` |
| `INITIAL_ADMIN_NAME` | `Mohamed Eldawy` |
| `INITIAL_ADMIN_PASSWORD` | A new password chosen by the owner |

The server creates the initial manager account only when no `Dawy` account exists. The password is stored as a scrypt hash. The browser receives only an HttpOnly session cookie and public user profile fields.

The application uses the Supabase REST API from the Express server. Do not add the Secret key to Vite variables (for example, `VITE_*`) or frontend code.

## Notes

- The dashboard state is stored in `public.dashboard_state`.
- User password hashes and session hashes are stored in `dashboard_users` and `dashboard_sessions`.
- Existing sample Quality member/meeting data is used to initialize the dashboard state only when the Supabase state row is empty.
- Do not deploy until the SQL schema has been applied and the Render environment variables have been set.
