const BUCKET = "recipe-images";

/**
 * Build a public URL for an object in the recipe-images bucket.
 * Returns null if no path was provided.
 */
export function recipeImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const RECIPE_IMAGES_BUCKET = BUCKET;
