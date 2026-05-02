import { Suspense } from "react";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { SearchBar } from "@/components/search-bar";
import { listCuisines, listRecipes, listTags } from "@/lib/recipes";

export const revalidate = 60;

type SearchParams = {
  q?: string;
  cuisine?: string;
  tag?: string;
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [cuisines, tags] = await Promise.all([listCuisines(), listTags()]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
          All recipes
        </h1>
        <p className="text-[var(--color-ink-soft)] text-sm">
          Search by name, cuisine, or tag.
        </p>
      </header>

      <SearchBar
        cuisines={cuisines}
        tags={tags.map((t) => ({ slug: t.slug, name: t.name }))}
      />

      <Suspense fallback={<RecipeGridSkeleton />}>
        <RecipeResults
          q={params.q}
          cuisine={params.cuisine}
          tag={params.tag}
        />
      </Suspense>
    </div>
  );
}

async function RecipeResults({
  q,
  cuisine,
  tag,
}: {
  q?: string;
  cuisine?: string;
  tag?: string;
}) {
  let recipes: Awaited<ReturnType<typeof listRecipes>> = [];
  let error: string | null = null;
  try {
    recipes = await listRecipes({ query: q, cuisine, tag });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load recipes";
  }

  if (error) {
    return (
      <p className="text-sm text-[var(--color-ink-soft)]">
        Couldn&apos;t load recipes. Check the Supabase configuration.
      </p>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
        <p className="text-[var(--color-ink-soft)]">
          No recipes match those filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}
