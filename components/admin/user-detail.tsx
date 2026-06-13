"use client";

import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import type {
  DailyContent,
  FinalGrowthPlan,
  Profile,
  UserProgress,
} from "@/types/database";

export interface UserRow {
  profile: Profile;
  progress: UserProgress[];
  plan: FinalGrowthPlan | null;
  completedDays: number;
  lastActive: string | null;
}

export function UserDetail({
  row,
  days,
  onClose,
}: {
  row: UserRow;
  days: DailyContent[];
  onClose: () => void;
}) {
  const progressByDay = new Map(row.progress.map((p) => [p.day_number, p]));

  function cellState(day: number): string {
    const p = progressByDay.get(day);
    if (!p) return "bg-cream-200 text-navy-700/40";
    if (isProgressComplete(p)) return "bg-gold-500 text-navy-900";
    if (p.reading_done || p.exercise_done || p.prayer_done)
      return "bg-navy-700 text-cream-50";
    return "bg-cream-200 text-navy-700/40";
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl animate-scale-in rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              {row.profile.full_name || "Unnamed"}
            </h2>
            <div className="mt-1 space-y-0.5 text-sm text-navy-700">
              <CopyLine label="Email" value={row.profile.email} />
              <CopyLine label="Phone" value={row.profile.phone_number || "—"} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-cream-200 px-3 py-1.5 text-sm text-navy-700 hover:bg-cream-100"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold text-navy-900">
          Progress: {row.completedDays}/{TOTAL_DAYS} days completed
        </p>

        {/* Day-by-day grid */}
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold ${cellState(day)}`}
              title={`Day ${day}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Exercise responses */}
        <h3 className="mt-6 font-semibold text-navy-900">Exercise Responses</h3>
        <div className="mt-2 space-y-2">
          {row.progress.filter((p) => p.exercise_response?.trim()).length ===
          0 ? (
            <p className="text-sm text-navy-700/60">No responses yet.</p>
          ) : (
            days.map((d) => {
              const p = progressByDay.get(d.day_number);
              if (!p?.exercise_response?.trim()) return null;
              return (
                <div
                  key={d.day_number}
                  className="rounded-lg border border-cream-200 bg-cream-50 p-3"
                >
                  <p className="text-xs font-semibold text-gold-600">
                    Day {d.day_number} · {d.topic}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-navy-800">
                    {p.exercise_response}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Growth plan */}
        <h3 className="mt-6 font-semibold text-navy-900">Final Growth Plan</h3>
        {row.plan?.submitted_at ? (
          <div className="mt-2 space-y-2 rounded-lg border border-cream-200 bg-cream-50 p-3 text-sm text-navy-800">
            <PlanRow label="Greatest Area of Growth" value={row.plan.greatest_area_of_growth} />
            <PlanRow label="Biggest Spiritual Challenge" value={row.plan.biggest_spiritual_challenge} />
            <PlanRow label="Habit #1" value={row.plan.habit_1} />
            <PlanRow label="Habit #2" value={row.plan.habit_2} />
            <PlanRow label="Habit #3" value={row.plan.habit_3} />
            <PlanRow label="Accountability Partner" value={row.plan.accountability_partner} />
            <PlanRow label="90-Day Goal" value={row.plan.ninety_day_goal} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-navy-700/60">Not submitted yet.</p>
        )}
      </div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="font-semibold">{label}: </span>
      <span>{value || "—"}</span>
    </div>
  );
}

function CopyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>
        {label}: {value}
      </span>
      {value && value !== "—" && (
        <button
          onClick={() => navigator.clipboard?.writeText(value)}
          className="rounded border border-cream-200 px-1.5 py-0.5 text-xs text-gold-600 hover:bg-cream-100"
          title={`Copy ${label.toLowerCase()}`}
        >
          Copy
        </button>
      )}
    </div>
  );
}
