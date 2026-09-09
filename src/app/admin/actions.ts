"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { RECIPE_IMAGES_BUCKET } from "@/lib/storage";

const ingredientSchema = z.object({
  position: z.number().int().nonnegative(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  name: z.string().min(1),
  notes: z.string().nullable(),
});

const instructionSchema = z.object({
  position: z.number().int().nonnegative(),
  step: z.string().min(1),
});

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  description: z.string().max(2000).nullable(),
  cuisine: z.string().max(80).nullable(),
  prep_time_minutes: z.number().int().nonnegative().nullable(),
  cook_time_minutes: z.number().int().nonnegative().nullable(),
  servings: z.number().int().positive().nullable(),
  hero_image_path: z.string().nullable(),
  published: z.boolean(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(instructionSchema),
  tagSlugs: z.array(z.string()),
});

export type RecipeFormState =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string }
  | undefined;

function readJson<T>(formData: FormData, key: string, fallback: T): T {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function intOrNull(v: FormDataEntryValue | null): number | null {
  const s = emptyToNull(v);
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function uploadHeroImage(
  file: File,
  slug: string,
): Promise<string> {
  const { supabase } = await requireAdmin();

  const arrayBuffer = await file.arrayBuffer();

  let normalizedBuffer: Buffer;
  try {
    normalizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error(
      "Image upload failed: unsupported image format. Please convert the file to JPG or PNG and try again.",
    );
  }

  const path = `${slug}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, normalizedBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return path;
}

async function ensureTags(slugs: string[]) {
  if (slugs.length === 0) return [] as { id: string; slug: string }[];
  const { supabase } = await requireAdmin();
  const rows = slugs.map((s) => ({ slug: s, name: s.replace(/-/g, " ") }));
  const { data, error } = await supabase
    .from("tags")
    .upsert(rows, { onConflict: "slug" })
    .select("id, slug");
  if (error) throw error;
  return data ?? [];
}

export async function createRecipeAction(
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  try {
    const { supabase } = await requireAdmin();

    const title = String(formData.get("title") ?? "").trim();
    const providedSlug = emptyToNull(formData.get("slug"));
    const slug = providedSlug ?? slugify(title);

    const ingredients = readJson<z.infer<typeof ingredientSchema>[]>(
      formData,
      "ingredients",
      [],
    );
    const instructions = readJson<z.infer<typeof instructionSchema>[]>(
      formData,
      "instructions",
      [],
    );
    const tagSlugs = readJson<string[]>(formData, "tagSlugs", []);

    let heroImagePath: string | null = null;
    const heroFile = formData.get("hero_image");
    if (heroFile instanceof File && heroFile.size > 0) {
      heroImagePath = await uploadHeroImage(heroFile, slug);
    }

    const parsed = recipeSchema.safeParse({
      title,
      slug,
      description: emptyToNull(formData.get("description")),
      cuisine: emptyToNull(formData.get("cuisine")),
      prep_time_minutes: intOrNull(formData.get("prep_time_minutes")),
      cook_time_minutes: intOrNull(formData.get("cook_time_minutes")),
      servings: intOrNull(formData.get("servings")),
      hero_image_path: heroImagePath,
      published: formData.get("published") === "on",
      ingredients,
      instructions,
      tagSlugs,
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join("; "),
      };
    }
    const v = parsed.data;

    const { data: inserted, error: insertErr } = await supabase
      .from("recipes")
      .insert({
        slug: v.slug,
        title: v.title,
        description: v.description,
        cuisine: v.cuisine,
        course: null,
        difficulty: null,
        prep_time_minutes: v.prep_time_minutes,
        cook_time_minutes: v.cook_time_minutes,
        servings: v.servings,
        hero_image_path: v.hero_image_path,
        published: v.published,
      })
      .select("id, slug")
      .single();

    if (insertErr || !inserted) {
      return {
        ok: false,
        error: insertErr?.message ?? "Failed to insert recipe.",
      };
    }

    if (v.ingredients.length > 0) {
      const { error: ingErr } = await supabase.from("ingredients").insert(
        v.ingredients.map((row, i) => ({
          recipe_id: inserted.id,
          position: i + 1,
          quantity: row.quantity,
          unit: row.unit,
          name: row.name,
          notes: row.notes,
        })),
      );
      if (ingErr) return { ok: false, error: ingErr.message };
    }

    if (v.instructions.length > 0) {
      const { error: insErr } = await supabase.from("instructions").insert(
        v.instructions.map((row, i) => ({
          recipe_id: inserted.id,
          position: i + 1,
          step: row.step,
        })),
      );
      if (insErr) return { ok: false, error: insErr.message };
    }

    if (v.tagSlugs.length > 0) {
      const tagRows = await ensureTags(v.tagSlugs);
      if (tagRows.length > 0) {
        await supabase
          .from("recipe_tags")
          .insert(tagRows.map((t) => ({ recipe_id: inserted.id, tag_id: t.id })));
      }
    }

    revalidatePath("/", "layout");
    return { ok: true, id: inserted.id, slug: inserted.slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateRecipeAction(
  id: string,
  _prev: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  try {
    const { supabase } = await requireAdmin();

    const { data: existing, error: existErr } = await supabase
      .from("recipes")
      .select("id, slug, hero_image_path")
      .eq("id", id)
      .single();
    if (existErr || !existing) {
      return { ok: false, error: "Recipe not found." };
    }

    const title = String(formData.get("title") ?? "").trim();
    const providedSlug = emptyToNull(formData.get("slug"));
    const slug = providedSlug ?? slugify(title);

    const ingredients = readJson<z.infer<typeof ingredientSchema>[]>(
      formData,
      "ingredients",
      [],
    );
    const instructions = readJson<z.infer<typeof instructionSchema>[]>(
      formData,
      "instructions",
      [],
    );
    const tagSlugs = readJson<string[]>(formData, "tagSlugs", []);

    const removeHero = formData.get("remove_hero_image") === "on";
    let heroImagePath: string | null = removeHero
      ? null
      : (existing.hero_image_path ?? null);
    const heroFile = formData.get("hero_image");
    if (heroFile instanceof File && heroFile.size > 0) {
      heroImagePath = await uploadHeroImage(heroFile, slug);
    }

    const parsed = recipeSchema.safeParse({
      title,
      slug,
      description: emptyToNull(formData.get("description")),
      cuisine: emptyToNull(formData.get("cuisine")),
      prep_time_minutes: intOrNull(formData.get("prep_time_minutes")),
      cook_time_minutes: intOrNull(formData.get("cook_time_minutes")),
      servings: intOrNull(formData.get("servings")),
      hero_image_path: heroImagePath,
      published: formData.get("published") === "on",
      ingredients,
      instructions,
      tagSlugs,
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join("; "),
      };
    }
    const v = parsed.data;

    const { error: updErr } = await supabase
      .from("recipes")
      .update({
        slug: v.slug,
        title: v.title,
        description: v.description,
        cuisine: v.cuisine,
        course: null,
        difficulty: null,
        prep_time_minutes: v.prep_time_minutes,
        cook_time_minutes: v.cook_time_minutes,
        servings: v.servings,
        hero_image_path: v.hero_image_path,
        published: v.published,
      })
      .eq("id", id);
    if (updErr) return { ok: false, error: updErr.message };

    // Replace child rows wholesale — simpler than diffing.
    await supabase.from("ingredients").delete().eq("recipe_id", id);
    if (v.ingredients.length > 0) {
      const { error: ingErr } = await supabase.from("ingredients").insert(
        v.ingredients.map((row, i) => ({
          recipe_id: id,
          position: i + 1,
          quantity: row.quantity,
          unit: row.unit,
          name: row.name,
          notes: row.notes,
        })),
      );
      if (ingErr) return { ok: false, error: ingErr.message };
    }

    await supabase.from("instructions").delete().eq("recipe_id", id);
    if (v.instructions.length > 0) {
      const { error: insErr } = await supabase.from("instructions").insert(
        v.instructions.map((row, i) => ({
          recipe_id: id,
          position: i + 1,
          step: row.step,
        })),
      );
      if (insErr) return { ok: false, error: insErr.message };
    }

    await supabase.from("recipe_tags").delete().eq("recipe_id", id);
    if (v.tagSlugs.length > 0) {
      const tagRows = await ensureTags(v.tagSlugs);
      if (tagRows.length > 0) {
        await supabase
          .from("recipe_tags")
          .insert(tagRows.map((t) => ({ recipe_id: id, tag_id: t.id })));
      }
    }

    revalidatePath("/", "layout");
    return { ok: true, id, slug: v.slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteRecipeAction(id: string) {
  const { supabase } = await requireAdmin();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("hero_image_path")
    .eq("id", id)
    .maybeSingle();

  if (recipe?.hero_image_path) {
    await supabase.storage
      .from(RECIPE_IMAGES_BUCKET)
      .remove([recipe.hero_image_path]);
  }

  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/", "layout");
}

export async function togglePublishAction(id: string, published: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("recipes")
    .update({ published })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
}
