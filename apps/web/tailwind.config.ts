import type { Config } from "tailwindcss";
import tailwindPreset from "./src/client/designSystems/tailwindPreset";

const config: Config = {
  presets: [tailwindPreset],
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
