"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DailyContent, ResourceLink } from "@/types/database";

export function ResourcesManager({ days }: { days: DailyContent[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-700">
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
    <div className="rounded-xl border border-cream-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium text-navy-900">
          Day {day.day_number} · {day.topic}
        </span>
        <span className="text-sm text-navy-700">
          {resources.length} link{resources.length === 1 ? "" : "s"} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-cream-200 p-4">
          {resources.length === 0 && (
            <p className="text-sm text-navy-700/60">No resources yet.</p>
          )}
          {resources.map((r, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={r.label}
                onChange={(e) => update(idx, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
              />
              <input
                value={r.url}
                onChange={(e) => update(idx, { url: e.target.value })}
                placeholder="https://…"
                className="flex-[2] rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
              />
              <button
                onClick={() => remove(idx)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={add}
              className="rounded-lg border border-cream-200 px-3 py-2 text-sm font-medium text-navy-700 hover:bg-cream-100"
            >
              + Add link
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-navy-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {savedAt && (
              <span className="text-xs text-navy-700/60">Saved {savedAt}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
