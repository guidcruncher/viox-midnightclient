// tailwind.config.ts
import { defineConfig } from "tailwindcss";

export default defineConfig({
  theme: {
    extend: {
      colors: {
        viox: {
          deep: "#2d005f",
          electric: "#8a2be2",
          ice: "#a0dfff",
          lilac: "#c8a2c8",
        },
      },
    },
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-viox": {
          /* WebKit */
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255,255,255,0.05)",
            "backdrop-filter": "blur(6px)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(138,43,226,0.4)",
            "border-radius": "8px",
            border: "2px solid rgba(0,0,0,0.4)",
            "box-shadow": "0 0 6px rgba(138,43,226,0.6)",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(138,43,226,0.7)",
            "box-shadow": "0 0 10px rgba(138,43,226,0.9)",
          },

          /* Firefox */
          "scrollbar-width": "thin",
          "scrollbar-color":
            "rgba(138,43,226,0.6) rgba(255,255,255,0.05)",
        },
      });
    },
  ],
});