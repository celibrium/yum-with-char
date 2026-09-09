import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { recipeImageUrl } from "@/lib/storage";
import type { RecipeListItem } from "@/types/recipe";

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const img = recipeImageUrl(recipe.hero_image_path);
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden hover:shadow-md transition"
    >
      <div className="relative aspect-[4/3] bg-[var(--color-accent-soft)]">
        {img ? (
          <Image
            src={img}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--color-ink-soft)] text-sm">
            no image yet
          </div>
        )}
        {!recipe.published && (
          <span className="absolute top-2 left-2 text-xs uppercase tracking-wide bg-[var(--color-ink)] text-white px-2 py-0.5 rounded-full">
            Draft
          </span>
        )}
        <div className="absolute bottom-2 right-2">
          <LikeButton
            recipeId={recipe.id}
            initialCount={recipe.like_count}
            size="sm"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="mt-1 text-sm text-[var(--color-ink-soft)] line-clamp-2">
            {recipe.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--color-ink-soft)]">
          {recipe.cuisine && <span>{recipe.cuisine}</span>}
          {totalTime > 0 && <span>· {totalTime} min</span>}
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      <div className="aspect-[4/3] bg-[var(--color-accent-soft)] animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-[var(--color-border)] rounded animate-pulse" />
        <div className="h-3 w-full bg-[var(--color-border)] rounded animate-pulse" />
      </div>
    </div>
  );
}
