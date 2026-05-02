import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Recipe not found
      </h1>
      <p className="text-[var(--color-ink-soft)]">
        The recipe you&apos;re looking for doesn&apos;t exist or hasn&apos;t
        been published yet.
      </p>
      <Link
        href="/recipes"
        className="inline-block rounded-full bg-[var(--color-accent)] text-white px-5 py-2 text-sm hover:opacity-90"
      >
        Browse all recipes
      </Link>
    </div>
  );
}
