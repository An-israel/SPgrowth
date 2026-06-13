"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, Field, FormMessage, SubmitButton } from "@/components/auth-ui";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone_number: phone },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setInfo(
        "Account created! Please check your email to confirm your address, then sign in."
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Begin your journey"
      subtitle="Create your account to start the 21-day growth program."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" type="text" value={fullName} onChange={setFullName} autoComplete="name" required />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <Field label="Phone Number" type="tel" value={phone} onChange={setPhone} autoComplete="tel" required />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={6} required />

        {error && <FormMessage kind="error">{error}</FormMessage>}
        {info && <FormMessage kind="info">{info}</FormMessage>}

        <SubmitButton loading={loading} loadingText="Creating account…">
          Sign Up
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
