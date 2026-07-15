/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#060913",
        darkCard: "rgba(17, 25, 40, 0.75)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        primaryEmerald: "#00F29B",
        accentRose: "#FF3366",
        accentAmber: "#FFB000",
        brandBlue: "#0066FF"
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(0, 242, 155, 0.25)",
        glowRose: "0 0 15px rgba(255, 51, 102, 0.25)",
        glowAmber: "0 0 15px rgba(255, 176, 0, 0.25)",
      }
    },
  },
  plugins: [],
}
