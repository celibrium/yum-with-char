import Link from "next/link";
import { RecipeCard } from "@/components/recipe-card";
import { listRecipes } from "@/lib/recipes";

export const revalidate = 60;

export default async function HomePage() {
  let recipes: Awaited<ReturnType<typeof listRecipes>> = [];
  let error: string | null = null;
  try {
    recipes = await listRecipes({ limit: 6 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load recipes";
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-border)] p-8 sm:p-12">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl tracking-tight">
          A recipe book, just for me.
        </h1>
        <p className="mt-3 max-w-xl text-[var(--color-ink-soft)]">
          A small corner of the internet for the dishes I make and love. Browse
          freely; only I can add or change them.
        </p>
        <Link
          href="/recipes"
          className="inline-block mt-6 rounded-full bg-[var(--color-accent)] text-white px-5 py-2 text-sm font-medium hover:opacity-90"
        >
          Browse recipes
        </Link>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Latest
          </h2>
          <Link
            href="/recipes"
            className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
          >
            See all →
          </Link>
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Couldn&apos;t load recipes right now. Make sure Supabase env vars
            are set in <code>.env.local</code>.
          </p>
        ) : recipes.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            No recipes yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
