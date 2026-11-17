import type { Config } from "tailwindcss";

// Identité IVOLOGIS (voir docs/audit/06_DESIGN_SYSTEM.md) : bleu lagune + terre latérite + sable.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B5563",
          dark: "#082F37",
        },
        accent: {
          DEFAULT: "#B5502A",
          soft: "#F6E7DF",
        },
        success: "#15803D",
        danger: "#DC2626",
        warning: "#B45309",
        surface: "#F7F4EE",
        ink: {
          DEFAULT: "#1C1917",
          muted: "#57534E",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
