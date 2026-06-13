"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import { getCelebrationMessage, type CelebrationMessage } from "@/lib/celebration";
import { fireConfetti } from "@/lib/confetti";
import { SignOutButton } from "@/components/sign-out-button";
import { DaySelector, type DayState } from "./day-selector";
import { DayCard } from "./day-card";
import { CelebrationModal } from "./celebration-modal";
import type { DailyContent, UserProgress } from "@/types/database";

export interface LocalProgress {
  reading_done: boolean;
  exercise_done: boolean;
  prayer_done: boolean;
  exercise_response: string | null;
}

const EMPTY: LocalProgress = {
  reading_done: false,
  exercise_done: false,
  prayer_done: false,
  exercise_response: null,
};

function buildMap(rows: UserProgress[]): Record<number, LocalProgress> {
  const map: Record<number, LocalProgress> = {};
  for (const r of rows) {
    map[r.day_number] = {
      reading_done: r.reading_done,
      exercise_done: r.exercise_done,
      prayer_done: r.prayer_done,
      exercise_response: r.exercise_response,
    };
  }
  return map;
}

export function DashboardClient({
  userId,
  fullName,
  isAdmin,
  days,
  initialProgress,
  currentDay,
}: {
  userId: string;
  fullName: string;
  isAdmin: boolean;
  days: DailyContent[];
  initialProgress: UserProgress[];
  currentDay: number;
}) {
  const supabase = createClient();
  const [progress, setProgress] = useState<Record<number, LocalProgress>>(() =>
    buildMap(initialProgress)
  );
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [celebration, setCelebration] = useState<CelebrationMessage | null>(null);
  const [responseSaving, setResponseSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getProgress = useCallback(
    (day: number): LocalProgress => progress[day] ?? EMPTY,
    [progress]
  );

  const completedCount = useMemo(
    () => Object.values(progress).filter(isProgressComplete).length,
    [progress]
  );

  const stateForDay = useCallback(
    (day: number): DayState => {
      const p = progress[day];
      if (!p) return "not-started";
      if (isProgressComplete(p)) return "complete";
      if (p.reading_done || p.exercise_done || p.prayer_done) return "in-progress";
      return "not-started";
    },
    [progress]
  );

  // Persist a progress patch (optimistic) and fire celebration on completion.
  const persist = useCallback(
    async (day: number, patch: Partial<LocalProgress>) => {
      const previous = progress[day] ?? EMPTY;
      const wasComplete = isProgressComplete(previous);
      const next = { ...previous, ...patch };

      setProgress((prev) => ({ ...prev, [day]: next }));

      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          day_number: day,
          reading_done: next.reading_done,
          exercise_done: next.exercise_done,
          prayer_done: next.prayer_done,
          exercise_response: next.exercise_response,
        },
        { onConflict: "user_id,day_number" }
      );

      if (error) {
        // Roll back on failure.
        setProgress((prev) => ({ ...prev, [day]: previous }));
        return;
      }

      if (!wasComplete && isProgressComplete(next)) {
        const msg = getCelebrationMessage(day);
        setCelebration(msg);
        fireConfetti(msg.isMilestone);
      }
    },
    [progress, supabase, userId]
  );

  const handleToggle = useCallback(
    (day: number, field: "reading_done" | "exercise_done" | "prayer_done") => {
      const current = progress[day] ?? EMPTY;
      persist(day, { [field]: !current[field] });
    },
    [progress, persist]
  );

  const handleResponseChange = useCallback(
    (day: number, value: string) => {
      // Optimistic local update so toggles preserve the latest text.
      setProgress((prev) => ({
        ...prev,
        [day]: { ...(prev[day] ?? EMPTY), exercise_response: value },
      }));
      setResponseSaving(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        await supabase.from("user_progress").upsert(
          {
            user_id: userId,
            day_number: day,
            exercise_response: value,
          },
          { onConflict: "user_id,day_number" }
        );
        setResponseSaving(false);
      }, 1200);
    },
    [supabase, userId]
  );

  const selectedContent = days.find((d) => d.day_number === selectedDay);
  const progressPct = Math.round((completedCount / TOTAL_DAYS) * 100);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="font-serif text-lg font-bold text-navy-800">
            ✦ IDLC Growth
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg border border-cream-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-cream-100"
              >
                Admin
              </Link>
            )}
            <Link
              href="/dashboard/growth-plan"
              className="rounded-lg border border-cream-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-cream-100"
            >
              Growth Plan
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Welcome + progress */}
        <section className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-navy-900">
            Welcome, {fullName.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-sm text-navy-700">
            Day {currentDay} of {TOTAL_DAYS} · {completedCount} day
            {completedCount === 1 ? "" : "s"} completed
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>

        {/* Day selector */}
        <section className="mb-6">
          <DaySelector
            total={TOTAL_DAYS}
            selectedDay={selectedDay}
            currentDay={currentDay}
            stateForDay={stateForDay}
            onSelect={setSelectedDay}
          />
        </section>

        {/* Day content */}
        {selectedContent && (
          <DayCard
            key={selectedContent.day_number}
            day={selectedContent}
            progress={getProgress(selectedDay)}
            onToggle={(field) => handleToggle(selectedDay, field)}
            onResponseChange={(value) =>
              handleResponseChange(selectedDay, value)
            }
            responseSaving={responseSaving}
          />
        )}

        <div className="mt-8 rounded-2xl border border-cream-200 bg-white p-5 text-center">
          <p className="font-serif text-lg text-navy-900">
            Ready to plan your future growth?
          </p>
          <Link
            href="/dashboard/growth-plan"
            className="mt-3 inline-block rounded-xl bg-navy-800 px-6 py-3 font-semibold text-cream-50 transition hover:bg-navy-700"
          >
            My Spiritual Growth Plan
          </Link>
        </div>
      </main>

      <CelebrationModal
        message={celebration}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
}
