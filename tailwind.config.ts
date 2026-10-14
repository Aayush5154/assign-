import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--bg-secondary)",
        card: "var(--card)",
        border: "var(--border)",
        accent: "var(--accent)",
        'accent-fg': "var(--accent-fg)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.25), 0 8px 24px -12px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
