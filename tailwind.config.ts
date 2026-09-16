import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "page-background": "#F7F6FB",
        "surface-card": "#FFFFFF",
        "primary": "#7C5CFC",
        "primary-dark": "#5B3FE0",
        "primary-fixed": "#E6DEFF",
        "primary-tint": "rgba(124, 92, 252, 0.08)",
        "text-primary": "#1F1B2E",
        "text-secondary": "#6B6478",
        "border-subtle": "#E7E3F5",
        
        // Kategori Warna (Informasi Utama)
        "category-kuliah": "#6C8CFF",
        "category-kuliah-tint": "#EAF0FF",
        "category-lomba": "#FFB648",
        "category-lomba-tint": "#FFF4E3",
        "category-kepanitiaan": "#35C0A5",
        "category-kepanitiaan-tint": "#E4FBF6",

        // Status Tugas
        "status-not-started": "#9C97AE",
        "status-not-started-tint": "#F0EEF7",
        "status-in-progress": "#FF8A4C",
        "status-in-progress-tint": "#FFEDE2",
        "status-completed": "#3FBE72",
        "status-completed-tint": "#E5F9EC",

        // Semantik Alert
        "semantic-urgent": "#FF5C7A",
        "semantic-urgent-tint": "#FFE7EC",
      },
      fontFamily: {
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px rgba(124, 92, 252, 0.08)",
        cardHover: "0 8px 24px rgba(124, 92, 252, 0.14)",
        modal: "0 20px 48px rgba(124, 92, 252, 0.18), 0 4px 12px rgba(31, 27, 46, 0.08)",
        dropdown: "0 12px 32px rgba(124, 92, 252, 0.15), 0 2px 8px rgba(31, 27, 46, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
