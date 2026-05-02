-- Row Level Security policies for yum-with-char.
--
-- Authorization model: a single hard-coded admin uuid stored in the
-- `public.app_admin` table. The `is_admin()` helper checks the calling
-- user's auth.uid() against that value. Rotate by updating the row.
--
-- IMPORTANT: After creating the admin user in Supabase Auth, run:
--
--     update public.app_admin set user_id = '<the-admin-uuid>' where id = 1;
--
-- (or insert the row if it does not exist yet — see bottom of this file).

-- ---------------------------------------------------------------------------
-- Admin registry + helper
-- ---------------------------------------------------------------------------
create table if not exists public.app_admin (
  id smallint primary key default 1,
  user_id uuid,
  constraint app_admin_singleton check (id = 1)
);

-- Seed a single row so updates are simple.
insert into public.app_admin (id, user_id)
values (1, null)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admin a
    where a.id = 1
      and a.user_id is not null
      and a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- The admin registry itself: readable to no one (we use is_admin()),
-- writable only via service role / SQL editor.
alter table public.app_admin enable row level security;
-- (No policies = default-deny for anon and authenticated.)

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------
alter table public.recipes enable row level security;

drop policy if exists "recipes are publicly readable when published"
  on public.recipes;
create policy "recipes are publicly readable when published"
  on public.recipes
  for select
  using (published = true);

drop policy if exists "admin can read all recipes" on public.recipes;
create policy "admin can read all recipes"
  on public.recipes
  for select
  using (public.is_admin());

drop policy if exists "admin can insert recipes" on public.recipes;
create policy "admin can insert recipes"
  on public.recipes
  for insert
  with check (public.is_admin());

drop policy if exists "admin can update recipes" on public.recipes;
create policy "admin can update recipes"
  on public.recipes
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete recipes" on public.recipes;
create policy "admin can delete recipes"
  on public.recipes
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------
alter table public.ingredients enable row level security;

drop policy if exists "ingredients of published recipes are public"
  on public.ingredients;
create policy "ingredients of published recipes are public"
  on public.ingredients
  for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = ingredients.recipe_id and r.published = true
    )
  );

drop policy if exists "admin full access to ingredients" on public.ingredients;
create policy "admin full access to ingredients"
  on public.ingredients
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- instructions
-- ---------------------------------------------------------------------------
alter table public.instructions enable row level security;

drop policy if exists "instructions of published recipes are public"
  on public.instructions;
create policy "instructions of published recipes are public"
  on public.instructions
  for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = instructions.recipe_id and r.published = true
    )
  );

drop policy if exists "admin full access to instructions" on public.instructions;
create policy "admin full access to instructions"
  on public.instructions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
alter table public.tags enable row level security;

drop policy if exists "tags are publicly readable" on public.tags;
create policy "tags are publicly readable"
  on public.tags
  for select
  using (true);

drop policy if exists "admin full access to tags" on public.tags;
create policy "admin full access to tags"
  on public.tags
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recipe_tags
-- ---------------------------------------------------------------------------
alter table public.recipe_tags enable row level security;

drop policy if exists "recipe_tags of published recipes are public"
  on public.recipe_tags;
create policy "recipe_tags of published recipes are public"
  on public.recipe_tags
  for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_tags.recipe_id and r.published = true
    )
  );

drop policy if exists "admin full access to recipe_tags" on public.recipe_tags;
create policy "admin full access to recipe_tags"
  on public.recipe_tags
  for all
  using (public.is_admin())
  with check (public.is_admin());
