# Supabase setup

This folder contains all SQL needed to provision a fresh Supabase project for `yum-with-char`.

## One-time provisioning

1. Create a new project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run the migrations in order:
   - `migrations/0001_init.sql`
   - `migrations/0002_rls.sql`
   - `migrations/0003_storage.sql`
   - `migrations/0004_likes.sql`
3. (Optional) Run `seed.sql` to insert a starter recipe.

## Create the admin user

1. Go to **Authentication → Users → Add user → Create new user**.
2. Email: `celibrium@hotmail.com`. Set the password and check "Auto Confirm User".
3. Copy the new user's UUID.
4. In SQL Editor, register them as the admin:

   ```sql
   update public.app_admin set user_id = '<paste-uuid-here>' where id = 1;
   ```

5. In **Authentication → Providers → Email**, turn off "Enable Sign Ups" so no one else can register.

## Wire the app

Copy `.env.local.example` to `.env.local` at the repo root and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — from Project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — from Project Settings → API (server-only, never expose)
- `ADMIN_USER_ID` — the same UUID you put into `app_admin`

## Schema-change workflow

After editing migrations, run `npm run supabase:types` to regenerate `src/types/database.ts` (requires the [Supabase CLI](https://supabase.com/docs/guides/cli) and a linked local project, or you can replace the script with the remote-project flavor).
