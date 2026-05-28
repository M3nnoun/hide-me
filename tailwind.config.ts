import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── shadcn/ui CSS-variable tokens ── */
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ── Brand orange ── */
        brand: {
          DEFAULT:    "#F97316",
          dim:        "#EA580C",
          bright:     "#FB923C",
          "50":       "#FFF7ED",
          glow:       "rgba(249,115,22,0.18)",
          "glow-sm":  "rgba(249,115,22,0.10)",
        },
        /* ── App surface palette ── */
        app: {
          bg:       "#0A0A0A",
          surface:  "#111111",
          card:     "#171717",
          raised:   "#1E1E1E",
          border:   "#2A2A2A",
          muted:    "#3D3D3D",
          text:     "#F5F5F5",
          subtext:  "#A3A3A3",
          dim:      "#6B6B6B",
        },
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
        sans:    ["var(--font-bricolage)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "brand-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(249,115,22,0.1), 0 0 40px rgba(249,115,22,0.08)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          "to": { transform: "rotate(360deg)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":        "fade-in 0.45s ease both",
        "scale-in":       "scale-in 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up":       "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "brand-pulse":    "brand-pulse 3s ease-in-out infinite",
        shimmer:          "shimmer 2.5s linear infinite",
        float:            "float 4s ease-in-out infinite",
        "spin-slow":      "spin-slow 8s linear infinite",
        glow:             "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
