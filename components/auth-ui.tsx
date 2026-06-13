import Link from "next/link";

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
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center font-serif text-lg font-bold text-navy-800"
        >
          ✦ IDLC Growth
        </Link>
        <div className="rounded-2xl border border-cream-200 bg-white p-7 shadow-xl shadow-navy-900/5 sm:p-8">
          <h1 className="font-serif text-2xl font-bold text-navy-900">{title}</h1>
          <p className="mt-1 text-sm text-navy-700">{subtitle}</p>
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
      <span className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-navy-900 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
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
          ? "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          : "rounded-lg bg-gold-400/15 px-3 py-2 text-sm text-navy-800"
      }
    >
      {children}
    </p>
  );
}
