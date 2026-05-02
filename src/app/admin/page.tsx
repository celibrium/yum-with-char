import Link from "next/link";
import { listRecipes } from "@/lib/recipes";
import { DeleteRecipeButton } from "./delete-button";
import { TogglePublishButton } from "./publish-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const recipes = await listRecipes({ includeDrafts: true, limit: 200 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">
          Recipes ({recipes.length})
        </h1>
        <Link
          href="/admin/recipes/new"
          className="rounded-full bg-[var(--color-accent)] text-white px-4 py-2 text-sm hover:opacity-90"
        >
          + New recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
          <p className="text-[var(--color-ink-soft)]">
            No recipes yet — go add your first one.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="space-y-3 sm:hidden">
            {recipes.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/recipes/${r.slug}`}
                      target="_blank"
                      className="block font-medium truncate hover:text-[var(--color-accent)]"
                    >
                      {r.title}
                    </Link>
                    <p className="text-xs text-[var(--color-ink-soft)] truncate mt-0.5">
                      {r.cuisine ?? "no cuisine"}
                    </p>
                  </div>
                  <StatusPill published={r.published} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <TogglePublishButton id={r.id} published={r.published} />
                  <Link
                    href={`/admin/recipes/${r.id}/edit`}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent-soft)]"
                  >
                    Edit
                  </Link>
                  <DeleteRecipeButton id={r.id} title={r.title} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-accent-soft)] text-left">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Cuisine</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-border)]"
                  >
                    <td className="px-4 py-2">
                      <Link
                        href={`/recipes/${r.slug}`}
                        className="hover:text-[var(--color-accent)]"
                        target="_blank"
                      >
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-[var(--color-ink-soft)]">
                      {r.cuisine ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <StatusPill published={r.published} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <TogglePublishButton
                          id={r.id}
                          published={r.published}
                        />
                        <Link
                          href={`/admin/recipes/${r.id}/edit`}
                          className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-accent-soft)]"
                        >
                          Edit
                        </Link>
                        <DeleteRecipeButton id={r.id} title={r.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
      Published
    </span>
  ) : (
    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
      Draft
    </span>
  );
}
