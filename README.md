# yum-with-char

A digital recipe book for myself <3

A single-admin recipe website built with Next.js, TypeScript, Tailwind CSS, and Supabase. Anyone can browse and read recipes; only I can add, edit, or delete them.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + Storage) with Row-Level Security
- **Zod** for input validation
- Server Actions for all mutations

## Project structure

```
src/
  app/
    page.tsx                  # public homepage
    recipes/                  # public browse + detail
    login/                    # admin sign-in (server action)
    auth/callback/            # supabase auth callback
    admin/                    # gated CRUD area
      layout.tsx              # auth guard + nav
      page.tsx                # dashboard table
      actions.ts              # create / update / delete / publish
      recipes/new/            # create form
      recipes/[id]/edit/      # edit form
    sitemap.ts, robots.ts
  components/
    recipe-card.tsx, search-bar.tsx
    admin/
      recipe-form.tsx, ingredient-editor.tsx, instruction-editor.tsx
  lib/
    supabase/{client,server,admin,middleware}.ts
    auth.ts, env.ts, recipes.ts, storage.ts, slug.ts, cn.ts
  types/
    database.ts (placeholder; regenerate with `npm run supabase:types`)
    recipe.ts
middleware.ts                  # session refresh + /admin gate
supabase/
  migrations/                  # 0001_init, 0002_rls, 0003_storage
  seed.sql, README.md
```

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision Supabase**

   Follow [supabase/README.md](supabase/README.md) — run all three migrations, create the admin user, and register the admin UUID in the `app_admin` table.

3. **Set environment variables**

   Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `ADMIN_USER_ID` (UUID of the admin user; same value you put into `app_admin.user_id`)
   - `NEXT_PUBLIC_SITE_URL` (optional, used by sitemap/robots)

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

5. **Sign in**

   Go to `/login`, sign in with the admin email + password you created in Supabase. You'll be redirected to `/admin`.

## Authorization model

There is exactly one admin. The check is enforced in three places:

1. `middleware.ts` redirects unauthenticated requests to `/admin/*` → `/login`.
2. `src/app/admin/layout.tsx` calls `requireAdmin()` which verifies `auth.uid()` matches `ADMIN_USER_ID` (server-side).
3. **Postgres RLS** is the source of truth: every write policy on `recipes`, `ingredients`, `instructions`, `tags`, and `recipe_tags` requires `is_admin()` (which checks `auth.uid()` against `public.app_admin.user_id`).

Even if every layer of the app were bypassed, the database would still refuse a write from anyone other than the admin user, because all client connections use the anon key, and RLS is on for every table.

The `recipe-images` storage bucket follows the same pattern: public read, admin-only writes.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import into Vercel; framework auto-detects as Next.js.
3. Add the env vars from `.env.local` to the Vercel project (mark `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_USER_ID` as server-only — they don't have the `NEXT_PUBLIC_` prefix so Next.js won't expose them).
4. In Supabase **Authentication → URL Configuration**, add the deployed origin to **Site URL** and **Redirect URLs** so the auth callback works.
5. In Supabase **Authentication → Providers → Email**, turn off "Enable Sign Ups" in production.

## Common tasks

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript only, no emit
- `npm run lint` — Next.js + TypeScript lint rules
- `npm run supabase:types` — regenerate `src/types/database.ts` from the Supabase project (requires the Supabase CLI; adjust the script if you use a remote project)
