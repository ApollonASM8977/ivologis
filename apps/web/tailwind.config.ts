import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B5FFF",
          dark: "#0B1F3A",
        },
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
        surface: "#F8FAFC",
        ink: {
          DEFAULT: "#111827",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
