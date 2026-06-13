/**
 * Text wordmark for the IDLC Spiritual Growth Tracker.
 *
 * The decorative emblem has been removed — to add your own logo image later,
 * drop the file at `public/logo.png` and render it here (a commented example
 * is left below).
 */
export function Logo({
  className = "",
  textClassName = "text-lg",
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/*
      // To use a real logo image, uncomment and ensure /public/logo.png exists:
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo.png" alt="IDLC" className="mr-2.5 h-9 w-9 rounded-xl object-contain" />
      */}
      <span
        className={`font-display font-extrabold tracking-tight text-ink ${textClassName}`}
      >
        IDLC <span className="text-gradient">Growth</span>
      </span>
    </span>
  );
}
