import type { Config } from "tailwindcss";
import tailwindPreset from "@repo/tokens/tailwindPreset";

const config: Config = {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  safelist: ["bg-gradient-to-br", "from-coral-500", "to-maroon-600"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
