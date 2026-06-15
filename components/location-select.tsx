"use client";

import { useState } from "react";
import { PRESET_LOCATIONS, OTHER_LOCATION, isPresetLocation } from "@/lib/locations";

/**
 * Location dropdown with an "Other (specify)" free-text fallback.
 * Emits the resolved location string (the preset, or whatever is typed for Other).
 */
export function LocationSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const startsOther = Boolean(value) && !isPresetLocation(value);
  const [choice, setChoice] = useState<string>(
    value ? (startsOther ? OTHER_LOCATION : value) : ""
  );
  const [custom, setCustom] = useState<string>(startsOther ? value : "");

  function handleChoice(v: string) {
    setChoice(v);
    onChange(v === OTHER_LOCATION ? custom : v);
  }
  function handleCustom(v: string) {
    setCustom(v);
    onChange(v);
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-ink outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20";

  return (
    <div className={`space-y-2 ${className}`}>
      <select
        value={choice}
        onChange={(e) => handleChoice(e.target.value)}
        className={inputClass}
        required
      >
        <option value="" disabled>
          Select your location
        </option>
        {PRESET_LOCATIONS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
        <option value={OTHER_LOCATION}>Other (specify)</option>
      </select>
      {choice === OTHER_LOCATION && (
        <input
          type="text"
          value={custom}
          onChange={(e) => handleCustom(e.target.value)}
          placeholder="Type your location"
          className={inputClass}
          required
        />
      )}
    </div>
  );
}
