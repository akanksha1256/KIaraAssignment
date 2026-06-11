import type { Config } from "tailwindcss";
import tokensPreset from "@repo/design-tokens/tailwind-preset";

const config: Config = {
  presets: [tokensPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
