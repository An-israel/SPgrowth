"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

export type DayState = "complete" | "in-progress" | "not-started";

export function DaySelector({
  total,
  selectedDay,
  currentDay,
  stateForDay,
  onSelect,
}: {
  total: number;
  selectedDay: number;
  currentDay: number;
  stateForDay: (day: number) => DayState;
  onSelect: (day: number) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDay]);

  return (
    <div
      className="no-scrollbar flex gap-2.5 overflow-x-auto px-1 py-2"
      role="tablist"
      aria-label="Select a day"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
        const state = stateForDay(day);
        const isSelected = day === selectedDay;
        const isCurrent = day === currentDay;

        const base =
          "relative grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-sm font-bold transition-all duration-200";
        const ring = isSelected
          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-canvas -translate-y-0.5"
          : "";

        let look = "";
        if (state === "complete") {
          look = "gradient-gold-green text-white shadow-soft animate-pop";
        } else if (state === "in-progress") {
          look =
            "glass text-indigo-700 border border-gold-400/60 shadow-[0_0_0_3px_rgba(232,181,72,0.15)]";
        } else {
          look = "glass text-muted hover:-translate-y-0.5";
        }

        return (
          <button
            key={day}
            ref={isSelected ? selectedRef : undefined}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(day)}
            className={`${base} ${look} ${ring}`}
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70">
                Day
              </span>
              {state === "complete" ? (
                <Check className="mt-0.5 h-5 w-5" strokeWidth={3} />
              ) : (
                <span className="mt-0.5 text-base">{day}</span>
              )}
            </span>
            {isCurrent && state !== "complete" && (
              <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-gold-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
