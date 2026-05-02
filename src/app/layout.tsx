import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pacifico, Caveat } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

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
    <html lang="en" className={`${pacifico.variable} ${caveat.variable}`}>
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
          className="flex items-center shrink-0 rounded-full ring-2 ring-transparent hover:ring-[var(--color-accent)]/30 transition focus:outline-none focus-visible:ring-[var(--color-accent)]/50"
          aria-label="YumWithChar home"
        >
          <Image
            src="/brand-icon.png"
            alt="YumWithChar"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            sizes="40px"
            priority
          />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hover:text-[var(--color-accent)]">
            Home
          </Link>
          <Link href="/recipes" className="hover:text-[var(--color-accent)]">
            Recipes
          </Link>
          <Link href="/about" className="hover:text-[var(--color-accent)]">
            About
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
