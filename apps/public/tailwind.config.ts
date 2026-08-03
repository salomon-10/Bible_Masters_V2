import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b5bdb",
          600: "#2f47b0",
          700: "#26398c",
        },
        live: "#e03131",
      },
    },
  },
  plugins: [],
};

export default config;
