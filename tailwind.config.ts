import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#171923", violet: { 500: "#7965E8", 600: "#6652D6" } }, boxShadow: { soft: "0 12px 40px rgba(31, 27, 66, .08)" } } },
  plugins: []
};
export default config;
