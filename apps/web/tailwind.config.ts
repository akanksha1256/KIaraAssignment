import type { Config } from "tailwindcss";
import tailwindPreset from "./src/app/designSystems/tailwindPreset";

const config: Config = {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
