import Image from "next/image";

/**
 * Brand mark for the IDLC Spiritual Growth Tracker.
 *
 * If a real logo file exists at /public/logo.png (or .svg) it is used; otherwise
 * we fall back to a clean built-in SVG emblem — a "rising light" (rays of light
 * over an upward leaf/flame) representing light + spiritual growth.
 *
 * To use your own logo: drop the file at `public/logo.png` and it will render
 * automatically via <LogoImage />, or keep the built-in <LogoMark />.
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="IDLC Growth logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lg-grow" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338CA" />
          <stop offset="0.55" stopColor="#5B4BDB" />
          <stop offset="1" stopColor="#E8B548" />
        </linearGradient>
      </defs>
      {/* Soft rounded badge */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lg-grow)" />
      {/* Rays of light */}
      <g stroke="#FBEFC9" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M24 9v4" />
        <path d="M33 12.5l-2.6 3" />
        <path d="M15 12.5l2.6 3" />
      </g>
      {/* Rising leaf / flame of growth */}
      <path
        d="M24 38c0-7 0-11 4.5-15.5C31 20 33 19 33 19s.5 3.5-2 7c-2.4 3.4-5.5 4.6-7 5.2"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <path
        d="M24 38c0-6 .2-9.5-3.6-13.4C18 22 16 21.2 16 21.2s-.4 3.1 1.8 6.1c2 2.8 4.6 3.8 6.2 4.3"
        fill="#FBEFC9"
        opacity="0.85"
      />
      <path d="M24 39.5V27.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  withText = true,
  className = "",
  textClassName = "text-lg",
}: {
  withText?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoImage />
      {withText && (
        <span className={`font-display font-extrabold tracking-tight text-ink ${textClassName}`}>
          IDLC <span className="text-gradient">Growth</span>
        </span>
      )}
    </span>
  );
}

/**
 * Renders the uploaded logo if present, else the built-in mark.
 * Next/Image needs known dimensions; we use a fixed square and let CSS size it.
 */
function LogoImage() {
  // Toggle this to true once you add /public/logo.png
  const HAS_CUSTOM_LOGO = false;
  if (HAS_CUSTOM_LOGO) {
    return (
      <Image
        src="/logo.png"
        alt="IDLC Growth"
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl object-contain"
        priority
      />
    );
  }
  return <LogoMark />;
}
