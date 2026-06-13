"use client";

import { useEffect } from "react";
import { PartyPopper, Trophy } from "lucide-react";
import type { CelebrationMessage } from "@/lib/celebration";

export function CelebrationModal({
  message,
  onClose,
}: {
  message: CelebrationMessage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/20 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm animate-scale-in rounded-3xl p-[2px] shadow-lift gradient-gold-indigo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[22px] bg-white p-8 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl gradient-gold-green text-white">
            {message.isMilestone ? (
              <Trophy className="h-8 w-8" />
            ) : (
              <PartyPopper className="h-8 w-8" />
            )}
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {message.title}
          </h2>
          <p className="mt-2 text-muted">{message.body}</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl gradient-gold-indigo px-6 py-3.5 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            Keep Going
          </button>
        </div>
      </div>
    </div>
  );
}
