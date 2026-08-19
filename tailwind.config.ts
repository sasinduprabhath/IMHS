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
        // Core brand
        ink: {
          DEFAULT: "#0A121E",
          light: "#162033",
          muted: "#4A5B70",
          subtle: "#94A3B8",
        },
        linen: {
          DEFAULT: "#F5F7FA",
          dark: "#E8EDF4",
        },
        // IMHS brand
        "clinical-teal": {
          DEFAULT: "#0E57A4",
          hover: "#0A4482",
          light: "#2172C9",
          surface: "#EBF3FA",
          muted: "#DBEAFE",
        },
        "chart-red": {
          DEFAULT: "#F16726",
          hover: "#D95316",
          light: "#FFF4EE",
        },
        sage: {
          DEFAULT: "#64748B",
          light: "#CBD5E1",
          dark: "#475569",
        },
        "chart-grid": {
          DEFAULT: "#E2E8F0",
          dark: "#CBD5E1",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          elevated: "#FFFFFF",
        },
        // Navy sidebar/admin
        navy: {
          DEFAULT: "#0A1628",
          light: "#0C1A30",
          muted: "#1A2D4A",
          border: "#1E3050",
          text: "rgba(255,255,255,0.62)",
          "text-active": "#FFFFFF",
        },
        // Error/incorrect state - WCAG AA compliant (5.05:1 on white). Use ONLY for errors.
        "clinical-red": {
          DEFAULT: "#C1443A",
          light: "#FDECEA",
          hover: "#A63830",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        "card-sm": "8px",
        "card-lg": "16px",
        "card-xl": "20px",
        btn: "10px",
        input: "10px",
        pill: "100px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(10,18,30,.04)",
        paper: "0 2px 8px rgba(10,18,30,.06), 0 1px 2px rgba(10,18,30,.04)",
        card: "0 4px 16px rgba(10,18,30,.08), 0 2px 4px rgba(10,18,30,.04)",
        "card-hover": "0 16px 48px rgba(10,18,30,.14), 0 4px 12px rgba(14,87,164,.08)",
        "paper-stack": "2px 2px 0px #E2E8F0",
        glow: "0 0 24px rgba(14,87,164,.18), 0 4px 16px rgba(14,87,164,.10)",
        "glow-lg": "0 0 40px rgba(14,87,164,.25), 0 8px 32px rgba(14,87,164,.14)",
        "glow-orange": "0 0 24px rgba(241,103,38,.20), 0 4px 16px rgba(241,103,38,.12)",
        sidebar: "4px 0 24px rgba(0,0,0,.25)",
        "nav-active": "0 2px 8px rgba(14,87,164,.25)",
        float: "0 8px 32px rgba(10,18,30,.18), 0 2px 8px rgba(10,18,30,.10)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 50%, #2172C9 100%)",
        "gradient-brand-warm": "linear-gradient(135deg, #0E57A4 0%, #1a5fa0 40%, #F16726 120%)",
        "gradient-hero": "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 50%, #ffffff 100%)",
        "gradient-navy": "linear-gradient(180deg, #0A1628 0%, #0d1e38 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(14,87,164,.04) 0%, rgba(14,87,164,.01) 100%)",
        "gradient-orange": "linear-gradient(135deg, #F16726 0%, #ff8c52 100%)",
        "gradient-mesh": "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(14,87,164,.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(241,103,38,.07) 0%, transparent 60%)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.8s linear infinite",
        float: "floatY 4s ease-in-out infinite",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
        "slide-up": "slideUp 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in": "fadeIn 0.35s ease-out",
        "badge-pop": "badgePop 0.35s cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(14,87,164,.20)" },
          "50%": { boxShadow: "0 0 32px rgba(14,87,164,.45)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        badgePop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
