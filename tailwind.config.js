/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        green: {
          50:  "#e6f7f0",
          100: "#ccefe1",
          200: "#99dfc3",
          300: "#66cfa5",
          400: "#33bf87",
          500: "#00B369",
          600: "#00975B",
          700: "#007a49",
          800: "#005e38",
          900: "#004126",
          950: "#002515",
        },
      },
      backgroundColor: {
        surface:  "var(--color-bg-surface)",
        page:     "var(--color-bg-page)",
        muted:    "var(--color-bg-muted)",
        hover:    "var(--color-bg-hover)",
        active:   "var(--color-bg-active)",
        brand:    "var(--color-brand)",
      },
      textColor: {
        primary:   "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary:  "var(--color-text-tertiary)",
        muted:     "var(--color-text-muted)",
        brand:     "var(--color-brand)",
      },
      borderColor: {
        DEFAULT:  "var(--color-border)",
        subtle:   "var(--color-border-subtle)",
        strong:   "var(--color-border-strong)",
        brand:    "var(--color-brand)",
      },
      ringColor: {
        DEFAULT:  "var(--color-border)",
        subtle:   "var(--color-border-subtle)",
        strong:   "var(--color-border-strong)",
      },
      divideColor: {
        DEFAULT: "var(--color-border)",
      },
    },
  },
  plugins: [],
}
