import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Heart, Sprout } from "lucide-react";
import { Logo } from "@/components/logo";
import { Blobs } from "@/components/blobs";
import { THEME_SCRIPTURE, THEME_SCRIPTURE_REF } from "@/lib/program";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-canvas">
      <Blobs />

      {/* Top bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <Link
          href="/login"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Sign In
        </Link>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-8 text-center sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50/70 px-4 py-1.5 text-sm font-semibold text-gold-600 backdrop-blur">
          <Sparkles className="h-4 w-4" /> Light to the World
        </span>

        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-7xl">
          The 21-Day
          <br />
          <span className="text-gradient">Spiritual Growth</span>
          <br />
          Journey
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          A three-week guided journey for undergraduate students, based on
          Kenneth E. Hagin&apos;s{" "}
          <span className="font-semibold text-ink">Growing Up, Spiritually</span>
          . A reading, a key truth, a practical exercise, and a prayer focus —
          every single day.
        </p>

        {/* Scripture glass card */}
        <div className="glass mt-10 w-full max-w-2xl rounded-3xl p-7 text-left">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-gold-indigo text-white">
              <Sprout className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-bold leading-snug text-ink">
                &ldquo;{THEME_SCRIPTURE}&rdquo;
              </p>
              <p className="mt-2 text-sm font-semibold text-indigo-600">
                {THEME_SCRIPTURE_REF}
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group flex w-full items-center justify-center gap-2 rounded-xl gradient-gold-indigo px-8 py-4 text-base font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:shadow-glow sm:w-auto"
          >
            Start the Journey
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border-2 border-indigo-200 bg-white/60 px-8 py-4 text-base font-bold text-indigo-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-500 sm:w-auto"
          >
            Sign In
          </Link>
        </div>

        {/* Week pillars */}
        <div className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: BookOpen, n: "Week 1", t: "Locating Yourself Spiritually" },
            { icon: Heart, n: "Week 2", t: "Walking With Your Father" },
            { icon: Sprout, n: "Week 3", t: "The Spiritual Man" },
          ].map((w) => (
            <div
              key={w.n}
              className="glass rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <w.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-gold-600">{w.n}</p>
              <p className="mt-0.5 text-sm font-medium text-ink">{w.t}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
