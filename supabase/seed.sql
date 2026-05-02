-- Optional seed data for local development.
-- Safe to re-run: uses ON CONFLICT to upsert.

-- ---------------------------------------------------------------------------
-- A starter recipe so the public pages have something to render.
-- ---------------------------------------------------------------------------
with upsert_recipe as (
  insert into public.recipes (
    slug, title, description, cuisine, course, difficulty,
    prep_time_minutes, cook_time_minutes, servings, published
  )
  values (
    'classic-tomato-soup',
    'Classic Tomato Soup',
    'A cozy weeknight tomato soup with a swirl of cream and fresh basil.',
    'American',
    'Soup',
    'easy',
    10, 25, 4, true
  )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    cuisine = excluded.cuisine,
    course = excluded.course,
    difficulty = excluded.difficulty,
    prep_time_minutes = excluded.prep_time_minutes,
    cook_time_minutes = excluded.cook_time_minutes,
    servings = excluded.servings,
    published = excluded.published
  returning id
)
insert into public.ingredients (recipe_id, position, quantity, unit, name, notes)
select
  (select id from upsert_recipe), pos, qty, unit, name, notes
from (values
  (1, 2::numeric, 'tbsp', 'olive oil', null),
  (2, 1::numeric, null, 'yellow onion, diced', null),
  (3, 3::numeric, 'cloves', 'garlic, minced', null),
  (4, 800::numeric, 'g', 'whole peeled tomatoes', '1 large can'),
  (5, 500::numeric, 'ml', 'vegetable stock', null),
  (6, 60::numeric, 'ml', 'cream', 'plus more for serving'),
  (7, null::numeric, null, 'fresh basil', 'to garnish')
) as v(pos, qty, unit, name, notes)
on conflict do nothing;

with r as (select id from public.recipes where slug = 'classic-tomato-soup')
insert into public.instructions (recipe_id, position, step)
select (select id from r), pos, step
from (values
  (1, 'Heat olive oil in a heavy pot over medium heat. Add the onion and a pinch of salt; cook until soft, 6-8 minutes.'),
  (2, 'Stir in the garlic and cook 30 seconds until fragrant.'),
  (3, 'Pour in the tomatoes (crushing them with your hands) and the stock. Simmer 20 minutes.'),
  (4, 'Blend until smooth with an immersion blender. Stir in the cream and season to taste.'),
  (5, 'Ladle into bowls and finish with a swirl of cream and torn basil.')
) as v(pos, step)
on conflict do nothing;

-- A few starter tags.
insert into public.tags (slug, name) values
  ('weeknight', 'Weeknight'),
  ('vegetarian', 'Vegetarian'),
  ('comfort', 'Comfort')
on conflict (slug) do nothing;

insert into public.recipe_tags (recipe_id, tag_id)
select r.id, t.id
from public.recipes r, public.tags t
where r.slug = 'classic-tomato-soup'
  and t.slug in ('weeknight', 'vegetarian', 'comfort')
on conflict do nothing;
