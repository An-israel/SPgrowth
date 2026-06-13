import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light, airy base
        canvas: "#FAFAFA",
        sand: "#F8F7F4",
        ink: "#1A1A1A",
        muted: "#6B7280",
        // Primary accent — "light"
        gold: {
          50: "#fdf8ec",
          100: "#faf0d2",
          200: "#f4df9c",
          300: "#f0d175",
          400: "#E8B548",
          500: "#d9a02f",
          600: "#b9831f",
        },
        // Secondary accent — depth / spirituality
        indigo: {
          50: "#eef0fe",
          100: "#e0e2fb",
          200: "#c4c6f8",
          400: "#7c74e8",
          500: "#5B4BDB",
          600: "#4f46e5",
          700: "#4338CA",
        },
        // Success / completion
        success: {
          400: "#4ade80",
          500: "#22C55E",
          600: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 40px -12px rgba(67, 56, 202, 0.18)",
        soft: "0 4px 24px -8px rgba(26, 26, 26, 0.12)",
        lift: "0 16px 48px -16px rgba(67, 56, 202, 0.28)",
        glow: "0 0 0 4px rgba(232, 181, 72, 0.18)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        pop: "pop 0.4s ease-out",
        float: "float 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
