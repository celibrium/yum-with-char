import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/recipes";
import { recipeImageUrl } from "@/lib/storage";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found" };
  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
    openGraph: {
      title: recipe.title,
      description: recipe.description ?? undefined,
      images: recipe.hero_image_path
        ? [recipeImageUrl(recipe.hero_image_path) ?? ""]
        : undefined,
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe || !recipe.published) notFound();

  const img = recipeImageUrl(recipe.hero_image_path);
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <article className="space-y-8">
      <div>
        <Link
          href="/recipes"
          className="inline-block text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
        >
          ← All recipes
        </Link>
      </div>

      <header className="space-y-3 mt-4 sm:mt-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl tracking-tight">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="text-[var(--color-ink-soft)] max-w-2xl">
            {recipe.description}
          </p>
        )}
        <dl className="flex flex-wrap gap-4 text-sm text-[var(--color-ink-soft)]">
          {recipe.cuisine && (
            <Meta label="Cuisine" value={recipe.cuisine} />
          )}
          {recipe.servings != null && (
            <Meta label="Serves" value={String(recipe.servings)} />
          )}
          {recipe.prep_time_minutes != null && (
            <Meta
              label="Prep"
              value={`${recipe.prep_time_minutes} min`}
            />
          )}
          {recipe.cook_time_minutes != null && (
            <Meta
              label="Cook"
              value={`${recipe.cook_time_minutes} min`}
            />
          )}
          {totalTime > 0 && (
            <Meta label="Total" value={`${totalTime} min`} />
          )}
        </dl>
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((t) => (
              <Link
                key={t.id}
                href={`/recipes?tag=${encodeURIComponent(t.slug)}`}
                className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-ink)] hover:bg-[var(--color-accent)] hover:text-white"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {img && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          <Image
            src={img}
            alt={recipe.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">
            Ingredients
          </h2>
          {recipe.ingredients.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              No ingredients listed.
            </p>
          ) : (
            <ul className="space-y-2">
              {recipe.ingredients.map((i) => (
                <li
                  key={i.id}
                  className="flex gap-2 text-sm border-b border-dashed border-[var(--color-border)] pb-2"
                >
                  <span className="text-[var(--color-ink-soft)] min-w-20">
                    {formatQty(i.quantity, i.unit)}
                  </span>
                  <span className="flex-1">
                    {i.name}
                    {i.notes && (
                      <span className="text-[var(--color-ink-soft)]">
                        {" "}
                        — {i.notes}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">
            Instructions
          </h2>
          {recipe.instructions.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              No steps yet.
            </p>
          ) : (
            <ol className="space-y-4 list-decimal pl-5 marker:text-[var(--color-accent)]">
              {recipe.instructions.map((step) => (
                <li key={step.id} className="leading-relaxed">
                  {step.step}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wide opacity-70">{label}</dt>
      <dd className="text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}

function formatQty(qty: number | null, unit: string | null): string {
  if (qty == null && !unit) return "—";
  const pretty =
    qty == null
      ? ""
      : Number.isInteger(qty)
        ? String(qty)
        : qty.toString().replace(/\.0+$/, "");
  return [pretty, unit].filter(Boolean).join(" ").trim();
}
