import Link from "next/link";
import { THEME_SCRIPTURE, THEME_SCRIPTURE_REF } from "@/lib/program";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-cream-50">
      {/* Soft radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-sm font-medium tracking-wide text-gold-400">
          ✦ Light to the World
        </span>

        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-6xl">
          The 21-Day Spiritual
          <br />
          Growth Journey
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/80 sm:text-lg">
          A three-week guided journey for undergraduate students, based on
          Kenneth E. Hagin&apos;s{" "}
          <span className="italic">Growing Up, Spiritually</span>. Each day
          brings a reading, a key truth, a practical exercise, and a prayer
          focus — to help you grow up in all things into Christ.
        </p>

        <blockquote className="mt-10 max-w-2xl border-l-2 border-gold-400/60 pl-5 text-left">
          <p className="font-serif text-lg italic text-cream-50 sm:text-xl">
            &ldquo;{THEME_SCRIPTURE}&rdquo;
          </p>
          <footer className="mt-2 text-sm font-medium text-gold-400">
            {THEME_SCRIPTURE_REF}
          </footer>
        </blockquote>

        <div className="mt-12 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-gold-500 px-8 py-3.5 text-center text-base font-semibold text-navy-900 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 sm:w-auto"
          >
            Start the Journey
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-cream-100/30 px-8 py-3.5 text-center text-base font-semibold text-cream-50 transition hover:bg-cream-50/10 sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { n: "Week 1", t: "Locating Yourself Spiritually" },
            { n: "Week 2", t: "Walking With Your Father" },
            { n: "Week 3", t: "The Spiritual Man" },
          ].map((w) => (
            <div
              key={w.n}
              className="rounded-xl border border-cream-100/10 bg-cream-50/5 p-4 text-left"
            >
              <p className="text-sm font-semibold text-gold-400">{w.n}</p>
              <p className="mt-1 text-sm text-cream-100/80">{w.t}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
