/** @type {import('tailwindcss').Config} */

// SuperFin's green, from its logo: emerald into lime. constants/Colors.ts
// takes its primary colours from this scale (Colors.test.ts keeps them equal).
const brand = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
  950: "#022c22",
};

module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand,
        // Streamyfin's accent was Tailwind purple, used as `*-purple-*` across
        // the app. Pointing it at the brand scale recolours every one of them
        // from here; deleting this line brings the purple back.
        purple: brand,
      },
    },
  },
  plugins: [],
};
