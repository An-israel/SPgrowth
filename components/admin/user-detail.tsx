"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";
import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import type {
  DailyContent,
  FinalGrowthPlan,
  Profile,
  UserProgress,
  UserRole,
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
  currentUserId,
  roleSaving,
  onSetRole,
  onClose,
}: {
  row: UserRow;
  days: DailyContent[];
  currentUserId: string;
  roleSaving: boolean;
  onSetRole: (userId: string, role: UserRole) => void;
  onClose: () => void;
}) {
  const isAdmin = row.profile.role === "admin";
  const isSelf = row.profile.id === currentUserId;
  const progressByDay = new Map(row.progress.map((p) => [p.day_number, p]));

  function cellState(day: number): string {
    const p = progressByDay.get(day);
    if (!p) return "bg-gray-100 text-muted/40";
    if (isProgressComplete(p)) return "gradient-gold-green text-white";
    if (p.reading_done || p.exercise_done || p.prayer_done)
      return "bg-indigo-500 text-white";
    return "bg-gray-100 text-muted/40";
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/20 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-strong my-8 w-full max-w-2xl animate-scale-in rounded-3xl p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              {row.profile.full_name || "Unnamed"}
            </h2>
            <div className="mt-1 space-y-0.5 text-sm text-muted">
              <CopyLine label="Email" value={row.profile.email} />
              <CopyLine label="Phone" value={row.profile.phone_number || "—"} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted transition hover:border-indigo-200 hover:text-indigo-700"
          >
            Close
          </button>
        </div>

        {/* Role management */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              isAdmin
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-muted"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isAdmin ? "Admin" : "Student"}
          </span>
          {isSelf ? (
            <span className="text-sm text-muted">This is you.</span>
          ) : isAdmin ? (
            <button
              onClick={() => {
                if (confirm(`Revoke admin access for ${row.profile.full_name || row.profile.email}?`))
                  onSetRole(row.profile.id, "student");
              }}
              disabled={roleSaving}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <ShieldOff className="h-4 w-4" />
              {roleSaving ? "Saving…" : "Revoke Admin"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm(`Make ${row.profile.full_name || row.profile.email} an admin? They'll get full access to this dashboard.`))
                  onSetRole(row.profile.id, "admin");
              }}
              disabled={roleSaving}
              className="inline-flex items-center gap-1.5 rounded-xl gradient-gold-indigo px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {roleSaving ? "Saving…" : "Promote to Admin"}
            </button>
          )}
        </div>

        <p className="mt-4 text-sm font-bold text-ink">
          Progress: {row.completedDays}/{TOTAL_DAYS} days completed
          <span className="ml-2 font-semibold text-gold-600">
            · PT joined: {row.progress.filter((p) => p.pt_done).length}/{TOTAL_DAYS}
          </span>
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
        <h3 className="mt-6 font-display text-lg font-bold text-ink">Exercise Responses</h3>
        <div className="mt-2 space-y-2">
          {row.progress.filter((p) => p.exercise_response?.trim()).length ===
          0 ? (
            <p className="text-sm text-muted/60">No responses yet.</p>
          ) : (
            days.map((d) => {
              const p = progressByDay.get(d.day_number);
              if (!p?.exercise_response?.trim()) return null;
              return (
                <div
                  key={d.day_number}
                  className="rounded-xl border border-gray-100 bg-white/60 p-3"
                >
                  <p className="text-xs font-bold text-gold-600">
                    Day {d.day_number} · {d.topic}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                    {p.exercise_response}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Growth plan */}
        <h3 className="mt-6 font-display text-lg font-bold text-ink">Final Growth Plan</h3>
        {row.plan?.submitted_at ? (
          <div className="mt-2 space-y-2 rounded-xl border border-gray-100 bg-white/60 p-3 text-sm text-ink">
            <PlanRow label="Greatest Area of Growth" value={row.plan.greatest_area_of_growth} />
            <PlanRow label="Biggest Spiritual Challenge" value={row.plan.biggest_spiritual_challenge} />
            <PlanRow label="Habit #1" value={row.plan.habit_1} />
            <PlanRow label="Habit #2" value={row.plan.habit_2} />
            <PlanRow label="Habit #3" value={row.plan.habit_3} />
            <PlanRow label="Accountability Partner" value={row.plan.accountability_partner} />
            <PlanRow label="90-Day Goal" value={row.plan.ninety_day_goal} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted/60">Not submitted yet.</p>
        )}
      </div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="font-bold">{label}: </span>
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
          className="rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-semibold text-gold-600 transition hover:bg-gold-50"
          title={`Copy ${label.toLowerCase()}`}
        >
          Copy
        </button>
      )}
    </div>
  );
}
