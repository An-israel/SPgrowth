"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className={
        className ??
        "rounded-xl border border-gray-200 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-muted backdrop-blur transition hover:border-indigo-200 hover:text-indigo-700"
      }
    >
      Sign Out
    </button>
  );
}
