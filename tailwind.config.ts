import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1A24",
          light: "#1C2B38",
          muted: "#3A4D5F",
        },
        linen: {
          DEFAULT: "#F4F6F9",
          dark: "#E3E8EF",
        },
        "clinical-teal": {
          DEFAULT: "#0E57A4", // IMHS Royal Blue from logo.png (#0e57a4)
          hover: "#0A4482",
          light: "#2172C9",
          surface: "#EBF3FA",
        },
        "chart-red": {
          DEFAULT: "#F16726", // IMHS Flame Orange from logo.png (#f16726)
          hover: "#D95316",
          light: "#FFF4EE",
        },
        "chart-orange": {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          light: "#FFFBEB",
        },
        "chart-blue": {
          DEFAULT: "#3B82F6",
        },
        sage: {
          DEFAULT: "#70889E",
          light: "#C5D2DE",
          dark: "#4B6175",
        },
        "chart-grid": {
          DEFAULT: "#D4DCE4",
          dark: "#B3C0CD",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
      },
      fontFamily: {
        // Display: Fraunces — marketing H1/H2 only, never below 28px
        display: ["var(--font-fraunces)", "sans-serif"],
        // Body/UI: Lexend — all body copy, lesson content, forms, tables, nav
        sans: ["var(--font-body)", "sans-serif"],
        // Utility/Data: IBM Plex Mono — stats, IDs, codes, timestamps
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "2px",
        btn: "8px",
        input: "8px",
      },
      boxShadow: {
        // Level 1 (card): standard hairline + subtle elevation
        paper: "0 1px 2px rgba(14, 87, 164, 0.05)",
        "paper-stack": "2px 2px 0px #D4DCE4",
        // Level 2 (raised): chart-red at 15% opacity, bottom-right — "lifted off chart pad"
        "paper-raised": "2px 2px 0px rgba(241, 103, 38, 0.15)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "vital-pulse": "vital-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "vital-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
