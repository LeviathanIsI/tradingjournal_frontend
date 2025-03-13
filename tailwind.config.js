/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Blue-500 color for primary elements
        secondary: "#14b8a6", // Teal-500 for secondary elements
        accent: "#8b5cf6", // Purple-500 for accent elements
        "dark-blue": {
          900: "#0f172a", // Very dark blue (almost black)
          800: "#1e293b", // Dark blue for backgrounds
          700: "#334155", // Slightly lighter blue
          600: "#475569", // Medium blue
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glow-blue": "0 0 25px rgba(59, 130, 246, 0.3)",
        "glow-purple": "0 0 25px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
