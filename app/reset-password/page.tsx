"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, FormMessage } from "@/components/auth-ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter and confirm your new password below."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={6} required />
        <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={6} required />
        {error && <FormMessage kind="error">{error}</FormMessage>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-navy-800 px-6 py-3 font-semibold text-cream-50 transition hover:bg-navy-700 disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AuthShell>
  );
}
