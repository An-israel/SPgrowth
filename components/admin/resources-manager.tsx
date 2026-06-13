"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DailyContent, ResourceLink } from "@/types/database";

export function ResourcesManager({ days }: { days: DailyContent[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Add recommended messages or links for each day. These appear in the
        student&apos;s day card. Changes save per day.
      </p>
      {days.map((day) => (
        <DayResourceEditor key={day.day_number} day={day} />
      ))}
    </div>
  );
}

function DayResourceEditor({ day }: { day: DailyContent }) {
  const supabase = createClient();
  const [resources, setResources] = useState<ResourceLink[]>(
    day.resources ?? []
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update(idx: number, patch: Partial<ResourceLink>) {
    setResources((r) =>
      r.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
  }
  function add() {
    setResources((r) => [...r, { label: "", url: "" }]);
  }
  function remove(idx: number) {
    setResources((r) => r.filter((_, i) => i !== idx));
  }

  async function save() {
    setSaving(true);
    const clean = resources.filter((r) => r.label.trim() && r.url.trim());
    const { error } = await supabase
      .from("daily_content")
      .update({ resources: clean })
      .eq("day_number", day.day_number);
    setSaving(false);
    if (!error) {
      setResources(clean);
      setSavedAt(new Date().toLocaleTimeString());
    }
  }

  return (
    <div className="glass rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="font-semibold text-ink">
          Day {day.day_number} · {day.topic}
        </span>
        <span className="text-sm font-medium text-muted">
          {resources.length} link{resources.length === 1 ? "" : "s"} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 p-4">
          {resources.length === 0 && (
            <p className="text-sm text-muted/60">No resources yet.</p>
          )}
          {resources.map((r, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={r.label}
                onChange={(e) => update(idx, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
              />
              <input
                value={r.url}
                onChange={(e) => update(idx, { url: e.target.value })}
                placeholder="https://…"
                className="flex-[2] rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
              />
              <button
                onClick={() => remove(idx)}
                className="rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={add}
              className="rounded-xl border border-gray-200 bg-white/60 px-3.5 py-2 text-sm font-semibold text-muted transition hover:border-indigo-200 hover:text-indigo-700"
            >
              + Add link
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl gradient-gold-indigo px-5 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {savedAt && (
              <span className="text-xs font-medium text-success-600">Saved {savedAt}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
