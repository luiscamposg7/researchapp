/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
    },
  },
  plugins: [],
}

