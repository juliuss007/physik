import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#040510",
        surface: "rgba(20, 24, 36, 0.75)",
        accent: "#8b5cf6",
        muted: "rgba(148, 163, 184, 0.08)",
        border: "rgba(148, 163, 184, 0.3)"
      },
      boxShadow: {
        glass: "0 10px 30px -15px rgba(15, 23, 42, 0.9)"
      },
      backdropBlur: {
        xs: "2px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
