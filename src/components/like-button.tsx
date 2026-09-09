"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const KEY = (id: string) => `liked:${id}`;

export function LikeButton({
  recipeId,
  initialCount,
  size = "sm",
}: {
  recipeId: string;
  initialCount: number;
  size?: "sm" | "md";
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY(recipeId))) setLiked(true);
  }, [recipeId]);

  function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (liked || pending) return;

    setLiked(true);
    setCount((c) => c + 1);
    try {
      localStorage.setItem(KEY(recipeId), "1");
    } catch {
      // private mode / quota — ignore
    }

    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("like_recipe", {
        p_recipe_id: recipeId,
      });
      if (error) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
        try {
          localStorage.removeItem(KEY(recipeId));
        } catch {
          // ignore
        }
        return;
      }
      if (typeof data === "number") setCount(data);
    });
  }

  const isMd = size === "md";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={liked || pending}
      aria-label={liked ? "You liked this recipe" : "Like this recipe"}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur transition select-none",
        "hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]",
        "disabled:cursor-default",
        isMd ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs",
        liked && "text-[var(--color-accent)] border-[var(--color-accent)]/40",
      )}
    >
      <Heart filled={liked} className={isMd ? "h-4 w-4" : "h-3.5 w-3.5"} />
      <span className="tabular-nums font-medium">{count}</span>
    </button>
  );
}

function Heart({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
