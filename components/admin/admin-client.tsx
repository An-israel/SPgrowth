"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import { SignOutButton } from "@/components/sign-out-button";
import { ResourcesManager } from "./resources-manager";
import { UserDetail, type UserRow } from "./user-detail";
import type {
  DailyContent,
  FinalGrowthPlan,
  Profile,
  UserProgress,
} from "@/types/database";

type Tab = "users" | "resources" | "settings";
type StatusFilter = "all" | "on-track" | "falling-behind";
type SortKey = "name" | "completed" | "active";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function AdminClient({
  profiles,
  progress,
  days,
  plans,
  programStartDate,
  currentDay,
}: {
  profiles: Profile[];
  progress: UserProgress[];
  days: DailyContent[];
  plans: FinalGrowthPlan[];
  programStartDate: string;
  currentDay: number;
}) {
  const [tab, setTab] = useState<Tab>("users");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [detail, setDetail] = useState<UserRow | null>(null);

  // Aggregate per-user data once.
  const rows: UserRow[] = useMemo(() => {
    const progByUser = new Map<string, UserProgress[]>();
    for (const p of progress) {
      const arr = progByUser.get(p.user_id) ?? [];
      arr.push(p);
      progByUser.set(p.user_id, arr);
    }
    const planByUser = new Map(plans.map((p) => [p.user_id, p]));

    return profiles
      .filter((pr) => pr.role !== "admin")
      .map((profile) => {
        const userProgress = progByUser.get(profile.id) ?? [];
        const completedDays = userProgress.filter(isProgressComplete).length;
        const lastActive =
          userProgress.length > 0
            ? userProgress.reduce(
                (max, p) => (p.updated_at > max ? p.updated_at : max),
                userProgress[0].updated_at
              )
            : null;
        return {
          profile,
          progress: userProgress,
          plan: planByUser.get(profile.id) ?? null,
          completedDays,
          lastActive,
        };
      });
  }, [profiles, progress, plans]);

  // Overview stats.
  const stats = useMemo(() => {
    const total = rows.length;
    const avgCompletion =
      total === 0
        ? 0
        : Math.round(
            (rows.reduce((s, r) => s + r.completedDays, 0) /
              (total * TOTAL_DAYS)) *
              100
          );
    const finished = rows.filter((r) => r.completedDays === TOTAL_DAYS).length;
    const now = Date.now();
    const inactive = rows.filter(
      (r) =>
        !r.lastActive || now - new Date(r.lastActive).getTime() > THREE_DAYS_MS
    ).length;
    return { total, avgCompletion, finished, inactive };
  }, [rows]);

  function isOnTrack(r: UserRow) {
    return r.completedDays >= currentDay;
  }

  const visibleRows = useMemo(() => {
    let result = rows.filter((r) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${r.profile.full_name} ${r.profile.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter === "on-track" && !isOnTrack(r)) return false;
      if (statusFilter === "falling-behind" && isOnTrack(r)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "name")
        return (a.profile.full_name || "").localeCompare(
          b.profile.full_name || ""
        );
      if (sortKey === "completed") return b.completedDays - a.completedDays;
      // active: most recent first
      const at = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const bt = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return bt - at;
    });

    return result;
  }, [rows, search, statusFilter, sortKey, currentDay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-serif text-lg font-bold text-navy-800">
            ✦ IDLC Admin
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-cream-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-cream-100"
            >
              My Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Registered Users" value={stats.total} />
          <StatCard label="Avg Completion" value={`${stats.avgCompletion}%`} />
          <StatCard label="Finished All 21" value={stats.finished} />
          <StatCard label="Inactive (3d+)" value={stats.inactive} />
        </section>

        {/* Tabs */}
        <nav className="mt-6 flex gap-1 rounded-xl bg-cream-200 p-1">
          {(
            [
              ["users", "Users"],
              ["resources", "Resources"],
              ["settings", "Settings"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab === key
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-navy-700 hover:text-navy-900"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-5">
          {tab === "users" && (
            <UsersTab
              rows={visibleRows}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortKey={sortKey}
              setSortKey={setSortKey}
              isOnTrack={isOnTrack}
              onSelect={setDetail}
            />
          )}
          {tab === "resources" && <ResourcesManager days={days} />}
          {tab === "settings" && (
            <SettingsTab initialDate={programStartDate} currentDay={currentDay} />
          )}
        </div>
      </main>

      {detail && (
        <UserDetail row={detail} days={days} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-4">
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-navy-700/70">
        {label}
      </p>
    </div>
  );
}

function UsersTab({
  rows,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortKey,
  setSortKey,
  isOnTrack,
  onSelect,
}: {
  rows: UserRow[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  sortKey: SortKey;
  setSortKey: (v: SortKey) => void;
  isOnTrack: (r: UserRow) => boolean;
  onSelect: (r: UserRow) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        >
          <option value="all">All statuses</option>
          <option value="on-track">On Track</option>
          <option value="falling-behind">Falling Behind</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-400"
        >
          <option value="name">Sort: Name</option>
          <option value="completed">Sort: Days Completed</option>
          <option value="active">Sort: Last Active</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-cream-200 bg-white p-6 text-center text-sm text-navy-700/60">
          No users match your filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-navy-700/70">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Contact</th>
                <th className="px-4 py-3">Progress</th>
                <th className="hidden px-4 py-3 md:table-cell">Last Active</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.profile.id}
                  onClick={() => onSelect(r)}
                  className="cursor-pointer border-t border-cream-200 transition hover:bg-cream-50"
                >
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {r.profile.full_name || "Unnamed"}
                  </td>
                  <td className="hidden px-4 py-3 text-navy-700 sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{r.profile.email}</span>
                      <CopyButton value={r.profile.email} />
                      {r.profile.phone_number && (
                        <CopyButton value={r.profile.phone_number} label="☎" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-cream-200">
                        <div
                          className="h-full rounded-full bg-gold-500"
                          style={{
                            width: `${(r.completedDays / TOTAL_DAYS) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-navy-700">
                        {r.completedDays}/{TOTAL_DAYS}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-navy-700 md:table-cell">
                    {r.lastActive
                      ? new Date(r.lastActive).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {isOnTrack(r) ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        On Track
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Falling Behind
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value);
      }}
      className="rounded border border-cream-200 px-1.5 py-0.5 text-xs text-gold-600 hover:bg-cream-100"
      title={`Copy ${value}`}
    >
      {label}
    </button>
  );
}

function SettingsTab({
  initialDate,
  currentDay,
}: {
  initialDate: string;
  currentDay: number;
}) {
  const supabase = createClient();
  const [date, setDate] = useState(initialDate.slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("app_config")
      .update({ program_start_date: date })
      .eq("id", 1);
    setSaving(false);
    if (!error) setSaved(true);
  }

  return (
    <div className="max-w-md rounded-2xl border border-cream-200 bg-white p-6">
      <h3 className="font-semibold text-navy-900">Program Start Date</h3>
      <p className="mt-1 text-sm text-navy-700">
        Controls which day is highlighted by default for students and the
        &ldquo;expected&rdquo; pace used for status badges. Today maps to{" "}
        <span className="font-semibold">Day {currentDay}</span>.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-navy-800 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-navy-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-sm text-green-700">
          Saved. Reload to see the new default day.
        </p>
      )}
    </div>
  );
}
