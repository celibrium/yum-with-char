import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "A little about char and this recipe journal.",
};

export default function AboutPage() {
  return (
    <article className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
      <h1 className="font-[family-name:var(--font-pacifico)] text-4xl sm:text-5xl text-[var(--color-accent)] text-center">
        About me
      </h1>
      <div className="font-[family-name:var(--font-caveat)] text-2xl sm:text-3xl leading-relaxed text-[var(--color-ink)] space-y-5">
        <p>Hi, I&apos;m Char. Welcome to my little corner of the internet.</p>
        <p>
          This is where I keep the recipes I make over and over again — the
          weeknight rescues, the slow Sundays, and the occasional ambitious
          experiment.
        </p>
        <p>(Replace this placeholder copy with whatever feels true.)</p>
      </div>
    </article>
  );
}
