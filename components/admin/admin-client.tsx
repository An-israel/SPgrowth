"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TOTAL_DAYS, isProgressComplete } from "@/lib/program";
import { SignOutButton } from "@/components/sign-out-button";
import { Logo } from "@/components/logo";
import { Blobs } from "@/components/blobs";
import { Users, TrendingUp, Award, Clock, Search } from "lucide-react";
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
    <div className="relative min-h-screen bg-canvas">
      <Blobs />
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="inline-flex items-center gap-2.5">
            <Logo withText={false} />
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              IDLC <span className="text-gradient">Admin</span>
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700"
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
          <StatCard icon={Users} label="Registered Users" value={stats.total} />
          <StatCard icon={TrendingUp} label="Avg Completion" value={`${stats.avgCompletion}%`} />
          <StatCard icon={Award} label="Finished All 21" value={stats.finished} />
          <StatCard icon={Clock} label="Inactive (3d+)" value={stats.inactive} />
        </section>

        {/* Tabs */}
        <nav className="glass mt-6 flex gap-1 rounded-2xl p-1.5">
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
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                tab === key
                  ? "gradient-gold-indigo text-white shadow-soft"
                  : "text-muted hover:text-ink"
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2.5 font-display text-3xl font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
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
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-gray-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-gold-400"
        >
          <option value="all">All statuses</option>
          <option value="on-track">On Track</option>
          <option value="falling-behind">Falling Behind</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-gold-400"
        >
          <option value="name">Sort: Name</option>
          <option value="completed">Sort: Days Completed</option>
          <option value="active">Sort: Last Active</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-center text-sm text-muted">
          No users match your filters.
        </p>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-white/40 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="hidden px-4 py-3 font-bold sm:table-cell">Contact</th>
                <th className="px-4 py-3 font-bold">Progress</th>
                <th className="hidden px-4 py-3 font-bold md:table-cell">Last Active</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.profile.id}
                  onClick={() => onSelect(r)}
                  className="cursor-pointer border-t border-gray-100 transition hover:bg-white/60"
                >
                  <td className="px-4 py-3 font-semibold text-ink">
                    {r.profile.full_name || "Unnamed"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">
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
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full gradient-gold-green"
                          style={{
                            width: `${(r.completedDays / TOTAL_DAYS) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted">
                        {r.completedDays}/{TOTAL_DAYS}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {r.lastActive
                      ? new Date(r.lastActive).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {isOnTrack(r) ? (
                      <span className="rounded-full bg-success-500/15 px-2.5 py-1 text-xs font-bold text-success-600">
                        On Track
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
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
      className="rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-semibold text-gold-600 transition hover:bg-gold-50"
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
    <div className="glass max-w-md rounded-2xl p-6">
      <h3 className="font-display text-lg font-bold text-ink">Program Start Date</h3>
      <p className="mt-1 text-sm text-muted">
        Controls which day is highlighted by default for students and the
        &ldquo;expected&rdquo; pace used for status badges. Today maps to{" "}
        <span className="font-bold text-indigo-600">Day {currentDay}</span>.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl gradient-gold-indigo px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-sm font-semibold text-success-600">
          Saved. Reload to see the new default day.
        </p>
      )}
    </div>
  );
}
