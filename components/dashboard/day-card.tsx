"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyContent } from "@/types/database";
import type { LocalProgress } from "./dashboard-client";

const WEEK_TITLES: Record<number, string> = {
  1: "Week 1 · Locating Yourself Spiritually",
  2: "Week 2 · Walking With Your Father",
  3: "Week 3 · The Spiritual Man",
};

export function DayCard({
  day,
  progress,
  onToggle,
  onResponseChange,
  responseSaving,
}: {
  day: DailyContent;
  progress: LocalProgress;
  onToggle: (field: "reading_done" | "exercise_done" | "prayer_done") => void;
  onResponseChange: (value: string) => void;
  responseSaving: boolean;
}) {
  const [response, setResponse] = useState(progress.exercise_response ?? "");
  const lastDay = useRef(day.day_number);

  // Reset the textarea when the selected day changes.
  useEffect(() => {
    if (lastDay.current !== day.day_number) {
      setResponse(progress.exercise_response ?? "");
      lastDay.current = day.day_number;
    }
  }, [day.day_number, progress.exercise_response]);

  return (
    <article className="animate-fade-in rounded-3xl border border-cream-200 bg-white p-6 shadow-sm sm:p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">
          {WEEK_TITLES[day.week_number]}
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-sm font-medium text-navy-700">
            Day {day.day_number} · {day.chapter}
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900">
          {day.topic}
        </h2>
      </header>

      {/* Key Truth */}
      <div className="mt-5 rounded-2xl border-l-4 border-gold-500 bg-cream-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
          Key Truth
        </p>
        <p className="mt-1 font-serif text-lg italic text-navy-900">
          {day.key_truth}
        </p>
      </div>

      {/* Reading */}
      <Section title="Reading" done={progress.reading_done}>
        <p className="text-navy-700">
          Read <span className="font-semibold">{day.chapter}</span> of{" "}
          <span className="italic">Growing Up, Spiritually</span>.
        </p>
        <TaskButton
          done={progress.reading_done}
          label="Mark Reading Done"
          onClick={() => onToggle("reading_done")}
        />
      </Section>

      {/* Practical Exercise */}
      <Section title="Practical Exercise" done={progress.exercise_done}>
        <p className="text-navy-700">{day.practical_exercise}</p>
        <div className="relative">
          <textarea
            value={response}
            onChange={(e) => {
              setResponse(e.target.value);
              onResponseChange(e.target.value);
            }}
            rows={4}
            placeholder="Write your response here…"
            className="w-full resize-y rounded-xl border border-cream-200 bg-cream-50 p-3 text-navy-900 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
          />
          <span className="mt-1 block text-right text-xs text-navy-700/60">
            {responseSaving ? "Saving…" : "Saved automatically"}
          </span>
        </div>
        <TaskButton
          done={progress.exercise_done}
          label="Mark Exercise Done"
          onClick={() => onToggle("exercise_done")}
        />
      </Section>

      {/* Prayer Focus */}
      <Section title="Prayer Focus" done={progress.prayer_done}>
        <p className="text-navy-700">{day.prayer_focus}</p>
        <TaskButton
          done={progress.prayer_done}
          label="Mark Prayer Done"
          onClick={() => onToggle("prayer_done")}
        />
      </Section>

      {/* Weekly Challenge (review days only) */}
      {day.is_review_day && day.weekly_challenge && (
        <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-400/15 to-cream-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
            🔥 Weekly Challenge
          </p>
          <p className="mt-1 font-medium text-navy-900">
            {day.weekly_challenge}
          </p>
        </div>
      )}

      {/* Recommended Resources */}
      {day.resources && day.resources.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-navy-900">
            Recommended Resources
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {day.resources.map((r, idx) => (
              <a
                key={idx}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm font-medium text-navy-800 transition hover:border-gold-400 hover:bg-cream-100"
              >
                <span className="truncate">{r.label}</span>
                <span aria-hidden className="text-gold-600">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-navy-700/50">Resources coming soon.</p>
      )}
    </article>
  );
}

function Section({
  title,
  done,
  children,
}: {
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-cream-200 pt-5">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="font-semibold text-navy-900">{title}</h3>
        {done && (
          <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-semibold text-gold-600">
            ✓ Done
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TaskButton({
  done,
  label,
  onClick,
}: {
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition sm:w-auto",
        done
          ? "bg-gold-500 text-navy-900 hover:bg-gold-400"
          : "border-2 border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-cream-50",
      ].join(" ")}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-current text-xs">
        {done ? "✓" : ""}
      </span>
      {done ? "Completed — tap to undo" : label}
    </button>
  );
}
