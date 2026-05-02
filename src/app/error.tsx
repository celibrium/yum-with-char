"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-16 space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Something went wrong.
      </h1>
      <p className="text-[var(--color-ink-soft)] text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[var(--color-accent)] text-white px-5 py-2 text-sm hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
