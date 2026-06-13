"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, FormMessage, SubmitButton } from "@/components/auth-ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Route admins to /admin, everyone else to /dashboard (or original target).
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let destination = searchParams.get("redirectedFrom") || "/dashboard";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin" && destination === "/dashboard") {
        destination = "/admin";
      }
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

      {error && <FormMessage kind="error">{error}</FormMessage>}

      <SubmitButton loading={loading} loadingText="Signing in…">
        Sign In
      </SubmitButton>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your growth journey.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
