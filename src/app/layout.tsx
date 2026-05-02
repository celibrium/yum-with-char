import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "yum with char",
    template: "%s · yum with char",
  },
  description: "A digital recipe book by char.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight"
        >
          yum with char
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hover:text-[var(--color-accent)]">
            Home
          </Link>
          <Link href="/recipes" className="hover:text-[var(--color-accent)]">
            Recipes
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-xs text-[var(--color-ink-soft)] flex items-center justify-between">
        <span>made with love by char</span>
        <Link href="/login" className="hover:text-[var(--color-accent)]">
          admin
        </Link>
      </div>
    </footer>
  );
}
