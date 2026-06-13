"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GRADUATION_PRAYER } from "@/lib/program";
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
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="font-serif text-lg font-bold text-navy-800">
            ✦ IDLC Growth
          </span>
          <Link
            href="/dashboard"
            className="rounded-lg border border-cream-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-cream-100"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-navy-900">
          My Spiritual Growth Plan
        </h1>
        <p className="mt-1 text-navy-700">
          The final project — reflect and set your direction for the journey
          ahead.
        </p>

        {showPrayer && (
          <div className="mt-6 animate-scale-in rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-400/15 to-cream-100 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
              🎓 Graduation Prayer
            </p>
            <p className="mt-2 font-serif text-lg italic leading-relaxed text-navy-900">
              {GRADUATION_PRAYER}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-navy-800">
                {f.label}
              </span>
              {f.multiline ? (
                <textarea
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-cream-200 bg-white p-3 text-navy-900 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
                />
              ) : (
                <input
                  type="text"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full rounded-xl border border-cream-200 bg-white p-3 text-navy-900 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
                />
              )}
            </label>
          ))}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-navy-800 px-6 py-3.5 font-semibold text-cream-50 transition hover:bg-navy-700 disabled:opacity-60"
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
