import type { MetadataRoute } from "next";
import { listRecipes } from "@/lib/recipes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/recipes`, changeFrequency: "weekly", priority: 0.9 },
  ];

  let recipes: Awaited<ReturnType<typeof listRecipes>> = [];
  try {
    recipes = await listRecipes({ limit: 500 });
  } catch {
    return staticEntries;
  }

  const recipeEntries: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${base}/recipes/${r.slug}`,
    lastModified: r.created_at ? new Date(r.created_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...recipeEntries];
}
