-- Storage bucket + policies for recipe images.
-- The bucket is public-read; only the admin can write/delete.

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do update set public = excluded.public;

-- Public read for objects in the recipe-images bucket.
drop policy if exists "recipe-images public read" on storage.objects;
create policy "recipe-images public read"
  on storage.objects
  for select
  using (bucket_id = 'recipe-images');

-- Admin-only inserts.
drop policy if exists "recipe-images admin insert" on storage.objects;
create policy "recipe-images admin insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'recipe-images'
    and public.is_admin()
  );

-- Admin-only updates.
drop policy if exists "recipe-images admin update" on storage.objects;
create policy "recipe-images admin update"
  on storage.objects
  for update
  using (bucket_id = 'recipe-images' and public.is_admin())
  with check (bucket_id = 'recipe-images' and public.is_admin());

-- Admin-only deletes.
drop policy if exists "recipe-images admin delete" on storage.objects;
create policy "recipe-images admin delete"
  on storage.objects
  for delete
  using (bucket_id = 'recipe-images' and public.is_admin());
