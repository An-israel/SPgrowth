"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import { getCelebrationMessage, type CelebrationMessage } from "@/lib/celebration";
import { fireConfetti } from "@/lib/confetti";
import { SignOutButton } from "@/components/sign-out-button";
import { Logo } from "@/components/logo";
import { Blobs } from "@/components/blobs";
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
    <div className="relative min-h-screen bg-canvas">
      <Blobs />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700"
              >
                Admin
              </Link>
            )}
            <Link
              href="/dashboard/growth-plan"
              className="hidden rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700 sm:inline-block"
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              Welcome, {fullName.split(" ")[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full gradient-gold-indigo px-3.5 py-1.5 text-sm font-bold text-white shadow-soft">
              Day {currentDay} of {TOTAL_DAYS}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-muted">
            {completedCount} of {TOTAL_DAYS} days completed · {progressPct}%
          </p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full gradient-gold-green transition-all duration-700"
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

        <div className="glass mt-8 rounded-3xl p-6 text-center">
          <p className="font-display text-xl font-bold text-ink">
            Ready to plan your future growth?
          </p>
          <Link
            href="/dashboard/growth-plan"
            className="mt-4 inline-block rounded-xl gradient-gold-indigo px-6 py-3.5 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
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
