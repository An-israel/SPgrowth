"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRESET_LOCATIONS, OTHER_LOCATION } from "@/lib/locations";

/**
 * Blocking prompt shown to any logged-in user who has no location set.
 * They pick their branch (cards) — or "Other" + free text — and it saves.
 */
export function LocationGate({
  userId,
  initialLocation,
}: {
  userId: string;
  initialLocation: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(
    !initialLocation || initialLocation.trim() === ""
  );
  const [choice, setChoice] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resolved = choice === OTHER_LOCATION ? custom.trim() : choice;

  async function save() {
    if (!resolved) {
      setError("Please select your location.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ location: resolved })
      .eq("id", userId);
    setSaving(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-md">
      <div className="w-full max-w-md animate-scale-in rounded-3xl bg-white p-7 shadow-lift sm:p-8">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl gradient-gold-green text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Thank you!
            </h2>
            <p className="mt-1 text-muted">
              You&apos;re set as <span className="font-semibold text-ink">{resolved}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-indigo-600">
              <MapPin className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wide">
                One quick thing
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
              What&apos;s your location?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Select your branch so your leaders can follow up with you.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {PRESET_LOCATIONS.map((l) => {
                const active = choice === l;
                return (
                  <button
                    key={l}
                    onClick={() => {
                      setChoice(l);
                      setError(null);
                    }}
                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-ink hover:border-indigo-200"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setChoice(OTHER_LOCATION);
                  setError(null);
                }}
                className={`col-span-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${
                  choice === OTHER_LOCATION
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-ink hover:border-indigo-200"
                }`}
              >
                Other (specify)
              </button>
            </div>

            {choice === OTHER_LOCATION && (
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Type your location"
                className="mt-3 w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-ink outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
                autoFocus
              />
            )}

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving || !resolved}
              className="mt-5 w-full rounded-xl gradient-gold-indigo px-6 py-3.5 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
