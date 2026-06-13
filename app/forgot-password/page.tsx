"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, FormMessage } from "@/components/auth-ui";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="space-y-4">
          <FormMessage kind="info">
            If an account exists for <strong>{email}</strong>, a password reset
            link is on its way. Check your inbox.
          </FormMessage>
          <Link
            href="/login"
            className="block rounded-xl bg-navy-800 px-6 py-3 text-center font-semibold text-cream-50 transition hover:bg-navy-700"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
          {error && <FormMessage kind="error">{error}</FormMessage>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-navy-800 px-6 py-3 font-semibold text-cream-50 transition hover:bg-navy-700 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-gold-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
