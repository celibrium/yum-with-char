import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        404 — page not found
      </h1>
      <p className="text-[var(--color-ink-soft)]">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-block rounded-full bg-[var(--color-accent)] text-white px-5 py-2 text-sm hover:opacity-90"
      >
        Back home
      </Link>
    </div>
  );
}
