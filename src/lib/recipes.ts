import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  RecipeListItem,
  RecipeWithDetails,
} from "@/types/recipe";

export type RecipeListFilters = {
  query?: string;
  cuisine?: string;
  tag?: string;
  limit?: number;
  includeDrafts?: boolean;
};

const LIST_COLUMNS =
  "id, slug, title, description, cuisine, hero_image_path, prep_time_minutes, cook_time_minutes, published, like_count, created_at";

export async function listRecipes(
  filters: RecipeListFilters = {},
): Promise<RecipeListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { query, cuisine, tag, limit = 50, includeDrafts = false } = filters;

  // If filtering by tag, resolve to recipe ids first.
  let recipeIdsByTag: string[] | null = null;
  if (tag) {
    const { data: tagRows } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .limit(1);
    const tagId = tagRows?.[0]?.id;
    if (!tagId) return [];
    const { data: rt } = await supabase
      .from("recipe_tags")
      .select("recipe_id")
      .eq("tag_id", tagId);
    recipeIdsByTag = (rt ?? []).map((r) => r.recipe_id);
    if (recipeIdsByTag.length === 0) return [];
  }

  let q = supabase
    .from("recipes")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!includeDrafts) {
    q = q.eq("published", true);
  }

  if (cuisine) q = q.eq("cuisine", cuisine);

  if (recipeIdsByTag) q = q.in("id", recipeIdsByTag);

  if (query && query.trim().length > 0) {
    const safe = query.trim().replace(/[%_]/g, " ");
    q = q.or(
      `title.ilike.%${safe}%,description.ilike.%${safe}%,cuisine.ilike.%${safe}%`,
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RecipeListItem[];
}

export async function getRecipeBySlug(
  slug: string,
): Promise<RecipeWithDetails | null> {
  const supabase = await createSupabaseServerClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!recipe) return null;

  const [{ data: ingredients }, { data: instructions }, { data: tagLinks }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("position", { ascending: true }),
      supabase
        .from("instructions")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("position", { ascending: true }),
      supabase
        .from("recipe_tags")
        .select("tag_id, tags(*)")
        .eq("recipe_id", recipe.id),
    ]);

  const tags = (tagLinks ?? [])
    .map((row) => (row as { tags: unknown }).tags)
    .filter((t): t is NonNullable<typeof t> => Boolean(t)) as RecipeWithDetails["tags"];

  return {
    ...recipe,
    ingredients: ingredients ?? [],
    instructions: instructions ?? [],
    tags,
  };
}

export async function getRecipeById(
  id: string,
): Promise<RecipeWithDetails | null> {
  const supabase = await createSupabaseServerClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!recipe) return null;

  const [{ data: ingredients }, { data: instructions }, { data: tagLinks }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("position", { ascending: true }),
      supabase
        .from("instructions")
        .select("*")
        .eq("recipe_id", recipe.id)
        .order("position", { ascending: true }),
      supabase
        .from("recipe_tags")
        .select("tag_id, tags(*)")
        .eq("recipe_id", recipe.id),
    ]);

  const tags = (tagLinks ?? [])
    .map((row) => (row as { tags: unknown }).tags)
    .filter((t): t is NonNullable<typeof t> => Boolean(t)) as RecipeWithDetails["tags"];

  return {
    ...recipe,
    ingredients: ingredients ?? [],
    instructions: instructions ?? [],
    tags,
  };
}

export async function listCuisines(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("recipes")
    .select("cuisine")
    .eq("published", true)
    .not("cuisine", "is", null);
  const set = new Set<string>();
  for (const r of data ?? []) {
    if (r.cuisine) set.add(r.cuisine);
  }
  return [...set].sort();
}

export async function listTags() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  return data ?? [];
}
