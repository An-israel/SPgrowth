"use client";

import { useEffect } from "react";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm animate-scale-in rounded-3xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2 text-5xl">
          {message.isMilestone ? "🌟" : "🎉"}
        </div>
        <h2 className="font-serif text-2xl font-bold text-navy-900">
          {message.title}
        </h2>
        <p className="mt-2 text-navy-700">{message.body}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gold-500 px-6 py-3 font-semibold text-navy-900 transition hover:bg-gold-400"
        >
          Keep Going
        </button>
      </div>
    </div>
  );
}
