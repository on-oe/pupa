/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/pages/**/*.{html,tsx}"],
  theme: {
    extend: {
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        breathe: "breathe 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
