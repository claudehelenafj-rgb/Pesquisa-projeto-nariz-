import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#FF6F59",
          sun: "#FFC93C",
          teal: "#2EC4B6",
          plum: "#6A4C93",
          cream: "#FFFBF4",
          ink: "#2B2118",
        },
        geracao: {
          azul: "#3B82F6",
          vermelho: "#EF4444",
          verde: "#22C55E",
          amarelo: "#EAB308",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
