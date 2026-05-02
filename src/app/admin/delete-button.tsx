"use client";

import { useTransition } from "react";
import { deleteRecipeAction } from "./actions";

export function DeleteRecipeButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Delete "${title}"? This will also remove its image and cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteRecipeAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs px-3 py-1 rounded-full border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
