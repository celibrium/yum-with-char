-- Heart-like counter for recipes.
-- Anonymous visitors can increment the count via the like_recipe() RPC.
-- The column itself is read-only to anon (RLS already restricts UPDATE),
-- so the only path that can change it is this security-definer function.

alter table public.recipes
  add column if not exists like_count integer not null default 0;

create or replace function public.like_recipe(p_recipe_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.recipes
     set like_count = like_count + 1
   where id = p_recipe_id
     and published = true
   returning like_count into new_count;
  return coalesce(new_count, 0);
end;
$$;

revoke all on function public.like_recipe(uuid) from public;
grant execute on function public.like_recipe(uuid) to anon, authenticated;
