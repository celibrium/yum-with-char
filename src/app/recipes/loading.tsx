import { RecipeCardSkeleton } from "@/components/recipe-card";

export default function RecipesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-[var(--color-border)] animate-pulse" />
      <div className="h-10 w-full rounded-full bg-[var(--color-border)] animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
