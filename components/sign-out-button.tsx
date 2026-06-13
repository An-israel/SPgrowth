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
        "rounded-lg border border-cream-200 px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-cream-100"
      }
    >
      Sign Out
    </button>
  );
}
