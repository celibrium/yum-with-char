"use client";

import { useTransition } from "react";
import { togglePublishAction } from "./actions";

export function TogglePublishButton({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await togglePublishAction(id, !published);
        })
      }
      className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent-soft)] disabled:opacity-50"
    >
      {pending
        ? "Saving..."
        : published
          ? "Unpublish"
          : "Publish"}
    </button>
  );
}
