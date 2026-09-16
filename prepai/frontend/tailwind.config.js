/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef8f6",
          100: "#d7f0eb",
          200: "#b4e2db",
          300: "#7ec9c4",
          400: "#4aaeb8",
          500: "#2f93a8",
          600: "#24748c",
          700: "#215d73",
          800: "#204b5d",
          900: "#1c3d4c",
        },
        peach: {
          50: "#fdf4ee",
          100: "#fae6d8",
          200: "#f4ccb3",
          300: "#eaa882",
          400: "#e08a5d",
          500: "#d06b3f",
        },
        mist: {
          50: "#fffcf8",
          100: "#f7f3ec",
          200: "#eee8dc",
          300: "#ddd4c4",
          400: "#c4b8a4",
          500: "#9e917c",
        },
        dark: {
          900: "#f6f3ec",
          800: "#fffcf8",
          700: "#eef4f2",
          600: "#e4ebe8",
          500: "#d3ddd8",
          400: "#b7c4bf",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
