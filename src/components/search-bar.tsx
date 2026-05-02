"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBar({
  cuisines,
  tags,
}: {
  cuisines: string[];
  tags: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cuisine, setCuisine] = useState(params.get("cuisine") ?? "");
  const [tag, setTag] = useState(params.get("tag") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCuisine(params.get("cuisine") ?? "");
    setTag(params.get("tag") ?? "");
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (cuisine) next.set("cuisine", cuisine);
    if (tag) next.set("tag", tag);
    const qs = next.toString();
    router.push(qs ? `/recipes?${qs}` : "/recipes");
  }

  function reset() {
    setQ("");
    setCuisine("");
    setTag("");
    router.push("/recipes");
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col sm:flex-row gap-2 sm:items-center"
    >
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search recipes..."
        className="flex-1 px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
      />
      <select
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
        className="px-3 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      >
        <option value="">All cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="px-3 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm hover:opacity-90"
        >
          Search
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-2 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent-soft)]"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
