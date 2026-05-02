-- Initial schema for yum-with-char.
-- Run after creating a fresh Supabase project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- recipes
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cuisine text,
  course text,
  difficulty text,
  prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes >= 0),
  cook_time_minutes integer check (cook_time_minutes is null or cook_time_minutes >= 0),
  servings integer check (servings is null or servings > 0),
  hero_image_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector
);

create index if not exists recipes_published_created_at_idx
  on public.recipes (published, created_at desc);

create index if not exists recipes_search_tsv_idx
  on public.recipes using gin (search_tsv);

create index if not exists recipes_cuisine_idx on public.recipes (cuisine);

-- Maintain search_tsv automatically.
create or replace function public.recipes_search_tsv_update()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.cuisine, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C');
  return new;
end
$$;

drop trigger if exists recipes_search_tsv_trg on public.recipes;
create trigger recipes_search_tsv_trg
before insert or update of title, description, cuisine on public.recipes
for each row execute function public.recipes_search_tsv_update();

-- Maintain updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  quantity numeric,
  unit text,
  name text not null,
  notes text
);

create index if not exists ingredients_recipe_id_position_idx
  on public.ingredients (recipe_id, position);

-- ---------------------------------------------------------------------------
-- instructions
-- ---------------------------------------------------------------------------
create table if not exists public.instructions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  step text not null
);

create index if not exists instructions_recipe_id_position_idx
  on public.instructions (recipe_id, position);

-- ---------------------------------------------------------------------------
-- tags + recipe_tags
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists public.recipe_tags (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create index if not exists recipe_tags_tag_id_idx on public.recipe_tags (tag_id);
