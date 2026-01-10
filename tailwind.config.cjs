/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)"
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
        none: "0"
      },
      fontFamily: {
        sans: ["Azeret Mono", "IBM Plex Mono", "JetBrains Mono", "SF Mono", "Menlo", "monospace"],
        mono: ["Azeret Mono", "IBM Plex Mono", "JetBrains Mono", "SF Mono", "Menlo", "monospace"]
      },
      boxShadow: {
        none: "none",
        glow: "none",
        glass: "none"
      },
      backgroundImage: {
        scanline: "repeating-linear-gradient(0deg, rgba(255,79,0,0.03) 0px, rgba(255,79,0,0.03) 1px, transparent 1px, transparent 2px)"
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem"
      }
    }
  },
  plugins: []
};
