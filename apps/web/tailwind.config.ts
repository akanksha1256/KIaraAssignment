import type { Config } from "tailwindcss";
import tailwindPreset from "@repo/tokens/tailwindPreset";

const config: Config = {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
