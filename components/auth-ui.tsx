import Link from "next/link";
import { Logo } from "@/components/logo";
import { Blobs } from "@/components/blobs";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <Blobs />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="glass-strong animate-scale-in rounded-3xl p-7 sm:p-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
  ...rest
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-ink outline-none transition placeholder:text-muted/60 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/20"
        {...rest}
      />
    </label>
  );
}

export function FormMessage({
  kind,
  children,
}: {
  kind: "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <p
      className={
        kind === "error"
          ? "rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600"
          : "rounded-xl border border-success-500/20 bg-success-500/10 px-3 py-2.5 text-sm text-success-600"
      }
    >
      {children}
    </p>
  );
}

/**
 * Turn raw Supabase/auth errors into clear, friendly messages. A "Failed to
 * fetch" almost always means the app can't reach Supabase — usually because the
 * NEXT_PUBLIC_SUPABASE_* env vars are missing on the deployment.
 */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("load failed")
  ) {
    return "Couldn't reach the server. The app may be missing its Supabase configuration — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and redeploy.";
  }
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  return message;
}

/** Bold gradient submit button shared across auth forms. */
export function SubmitButton({
  loading,
  children,
  loadingText,
}: {
  loading: boolean;
  children: React.ReactNode;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl gradient-gold-indigo px-6 py-3.5 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-60"
    >
      {loading ? loadingText : children}
    </button>
  );
}
