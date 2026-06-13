"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GRADUATION_PRAYER } from "@/lib/program";
import { Logo } from "@/components/logo";
import { Blobs } from "@/components/blobs";
import type { FinalGrowthPlan } from "@/types/database";

type PlanFields = Omit<FinalGrowthPlan, "id" | "user_id" | "submitted_at">;

const FIELDS: { key: keyof PlanFields; label: string; multiline?: boolean }[] = [
  { key: "greatest_area_of_growth", label: "Greatest Area of Growth", multiline: true },
  { key: "biggest_spiritual_challenge", label: "Biggest Spiritual Challenge", multiline: true },
  { key: "habit_1", label: "Habit #1" },
  { key: "habit_2", label: "Habit #2" },
  { key: "habit_3", label: "Habit #3" },
  { key: "accountability_partner", label: "Accountability Partner" },
  { key: "ninety_day_goal", label: "90-Day Spiritual Growth Goal", multiline: true },
];

export function GrowthPlanForm({
  userId,
  initialPlan,
}: {
  userId: string;
  initialPlan: FinalGrowthPlan | null;
}) {
  const supabase = createClient();
  const [values, setValues] = useState<PlanFields>({
    greatest_area_of_growth: initialPlan?.greatest_area_of_growth ?? "",
    biggest_spiritual_challenge: initialPlan?.biggest_spiritual_challenge ?? "",
    habit_1: initialPlan?.habit_1 ?? "",
    habit_2: initialPlan?.habit_2 ?? "",
    habit_3: initialPlan?.habit_3 ?? "",
    accountability_partner: initialPlan?.accountability_partner ?? "",
    ninety_day_goal: initialPlan?.ninety_day_goal ?? "",
  });
  const [submitted, setSubmitted] = useState(Boolean(initialPlan?.submitted_at));
  const [showPrayer, setShowPrayer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: keyof PlanFields, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: upsertError } = await supabase.from("final_growth_plan").upsert(
      {
        user_id: userId,
        ...values,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setSubmitted(true);
    setShowPrayer(true);
    setSaving(false);
  }

  return (
    <div className="relative min-h-screen bg-canvas">
      <Blobs />
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          My Spiritual Growth Plan
        </h1>
        <p className="mt-1.5 text-muted">
          The final project — reflect and set your direction for the journey
          ahead.
        </p>

        {showPrayer && (
          <div className="mt-6 animate-scale-in rounded-3xl gradient-gold-indigo p-6 text-white shadow-lift">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-wide">
                Graduation Prayer
              </p>
            </div>
            <p className="mt-2 text-lg font-semibold italic leading-relaxed">
              {GRADUATION_PRAYER}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-strong mt-6 space-y-5 rounded-3xl p-6 sm:p-7">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                {f.label}
              </span>
              {f.multiline ? (
                <textarea
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white/80 p-3.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
                />
              ) : (
                <input
                  type="text"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 p-3.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
                />
              )}
            </label>
          ))}

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl gradient-gold-indigo px-6 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : submitted
                ? "Update My Growth Plan"
                : "Submit My Growth Plan"}
          </button>
        </form>
      </main>
    </div>
  );
}
