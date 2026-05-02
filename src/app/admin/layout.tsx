import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/app/login/actions";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <nav className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-medium">
            Dashboard
          </Link>
          <Link
            href="/admin/recipes/new"
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
          >
            New recipe
          </Link>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
          >
            Sign out
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
