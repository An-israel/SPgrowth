"use client";

import { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Bring the selected day into view on mount / change.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDay]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar flex gap-2 overflow-x-auto pb-2"
      role="tablist"
      aria-label="Select a day"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
        const state = stateForDay(day);
        const isSelected = day === selectedDay;
        const isCurrent = day === currentDay;

        return (
          <button
            key={day}
            ref={isSelected ? selectedRef : undefined}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(day)}
            className={[
              "relative flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-2xl border-2 text-sm font-semibold transition",
              isSelected
                ? "scale-105 border-navy-800 ring-2 ring-gold-400/50"
                : "border-transparent",
              state === "complete"
                ? "bg-gold-500 text-navy-900"
                : state === "in-progress"
                  ? "bg-navy-700 text-cream-50"
                  : "bg-white text-navy-700 shadow-sm",
            ].join(" ")}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
              Day
            </span>
            <span className="leading-none">{day}</span>
            {state === "complete" && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-navy-800 text-[9px] text-gold-400">
                ✓
              </span>
            )}
            {isCurrent && state !== "complete" && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-gold-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
