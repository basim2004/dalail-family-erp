import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dalail: {
          primary: "#164A9B",
          secondary: "#2876C8",
          navy: "#0C2F66",
          dark: "#0F326A",
          light: "#EAF3FF",
          bg: "#F5F8FC",
          card: "#FFFFFF",
          border: "#DCE7F5",
          success: "#159B73",
          warning: "#E99A24",
          gold: "#E99A24",
          error: "#D94343",
          text: "#1E293B",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        playfair: ["'Playfair Display'", "Georgia", "serif"],
        arabic: ["Amiri", "Traditional Arabic", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(22, 74, 155, 0.05), 0 1px 2px -1px rgba(22, 74, 155, 0.05)",
        card: "0 4px 6px -1px rgba(22, 74, 155, 0.07), 0 2px 4px -2px rgba(22, 74, 155, 0.05)",
        float: "0 10px 15px -3px rgba(22, 74, 155, 0.1), 0 4px 6px -4px rgba(22, 74, 155, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;

