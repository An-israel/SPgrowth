"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  PenLine,
  HandHeart,
  Check,
  Flame,
  ExternalLink,
  Sparkles,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { DailyContent } from "@/types/database";
import type { LocalProgress, ToggleField } from "./dashboard-client";

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
  onToggle: (field: ToggleField) => void;
  onResponseChange: (value: string) => void;
  responseSaving: boolean;
}) {
  const [response, setResponse] = useState(progress.exercise_response ?? "");
  const lastDay = useRef(day.day_number);

  useEffect(() => {
    if (lastDay.current !== day.day_number) {
      setResponse(progress.exercise_response ?? "");
      lastDay.current = day.day_number;
    }
  }, [day.day_number, progress.exercise_response]);

  return (
    <article className="glass-strong animate-fade-in rounded-3xl p-6 sm:p-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-gold-600">
          {WEEK_TITLES[day.week_number]}
        </p>
        <p className="mt-1 text-sm font-semibold text-muted">
          Day {day.day_number} · {day.chapter}
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          {day.topic}
        </h2>
        <div className="mt-3 h-1.5 w-16 rounded-full gradient-gold-indigo" />
      </header>

      {/* Key Truth */}
      <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/70 p-5">
        <div className="flex items-center gap-2 text-gold-600">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            Key Truth
          </span>
        </div>
        <p className="mt-1.5 font-display text-lg font-bold text-ink">
          {day.key_truth}
        </p>
      </div>

      {/* Reading */}
      <Section icon={BookOpen} title="Reading" done={progress.reading_done}>
        <p className="text-muted">
          Read <span className="font-semibold text-ink">{day.chapter}</span> of{" "}
          <span className="italic">Growing Up, Spiritually</span>.
        </p>
        <TaskButton
          done={progress.reading_done}
          label="Mark Reading Done"
          onClick={() => onToggle("reading_done")}
        />
      </Section>

      {/* Practical Exercise */}
      <Section icon={PenLine} title="Practical Exercise" done={progress.exercise_done}>
        <p className="text-muted">{day.practical_exercise}</p>
        <div>
          <textarea
            value={response}
            onChange={(e) => {
              setResponse(e.target.value);
              onResponseChange(e.target.value);
            }}
            rows={4}
            placeholder="Write your response here…"
            className="w-full resize-y rounded-xl border border-gray-200 bg-white/80 p-3.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
          />
          <span className="mt-1 block text-right text-xs text-muted/70">
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
      <Section icon={HandHeart} title="Prayer Focus" done={progress.prayer_done}>
        <p className="text-muted">{day.prayer_focus}</p>
        <TaskButton
          done={progress.prayer_done}
          label="Mark Prayer Done"
          onClick={() => onToggle("prayer_done")}
        />
      </Section>

      {/* Prophetic Takeoff (PT) — daily church morning prayer */}
      <Section icon={Sunrise} title="Prophetic Takeoff (PT)" done={progress.pt_done}>
        <p className="text-muted">
          Our morning prayer (Prophetic Takeoff) holds daily from{" "}
          <span className="font-semibold text-ink">5:00–6:00am</span>.
        </p>
        <p className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-muted">
          💡 If you haven&apos;t joined yet, search{" "}
          <span className="font-semibold text-ink">&ldquo;Prophetic Takeoff&rdquo;</span>{" "}
          on YouTube and pray along — then come back and click{" "}
          <span className="font-semibold text-ink">Done</span>.
        </p>
        <TaskButton
          done={progress.pt_done}
          label="Mark PT Done"
          onClick={() => onToggle("pt_done")}
        />
      </Section>

      {/* Weekly Challenge (review days only) */}
      {day.is_review_day && day.weekly_challenge && (
        <div className="mt-6 overflow-hidden rounded-2xl gradient-gold-indigo p-5 text-white shadow-soft">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Weekly Challenge
            </span>
          </div>
          <p className="mt-2 text-lg font-bold leading-snug">
            {day.weekly_challenge}
          </p>
        </div>
      )}

      {/* Recommended Resources */}
      {day.resources && day.resources.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-bold text-ink">Recommended Resources</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {day.resources.map((r, idx) => (
              <a
                key={idx}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:text-gold-600 hover:shadow-lift"
              >
                <span className="truncate">{r.label}</span>
                <ExternalLink className="h-4 w-4 shrink-0 text-gold-500" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted/60">Resources coming soon.</p>
      )}
    </article>
  );
}

function Section({
  icon: Icon,
  title,
  done,
  children,
}: {
  icon: LucideIcon;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-gray-100 bg-white/50 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className={`grid h-9 w-9 place-items-center rounded-xl ${
            done ? "bg-success-500/15 text-success-600" : "bg-indigo-50 text-indigo-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        {done && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success-500/15 px-2.5 py-1 text-xs font-bold text-success-600">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Done
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
  doneLabel = "Completed — tap to undo",
  onClick,
}: {
  done: boolean;
  label: string;
  doneLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition sm:w-auto",
        done
          ? "gradient-gold-green text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
          : "border-2 border-indigo-200 text-indigo-700 hover:-translate-y-0.5 hover:border-indigo-500",
      ].join(" ")}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-md border-2 ${
          done ? "border-white/70 bg-white/20" : "border-current"
        }`}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {done ? doneLabel : label}
    </button>
  );
}
