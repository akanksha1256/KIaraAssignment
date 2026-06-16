// Kiara type scale — Albert Sans primary, Sentient for display/editorial
export const fontFamilies = {
  sans: "'Albert Sans', system-ui, sans-serif",
  serif: "'Sentient', Georgia, serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const typeScale = {
  display: { fontSize: "48px", fontWeight: 600, lineHeight: 1.1, fontFamily: "serif" },
  h1: { fontSize: "36px", fontWeight: 600, lineHeight: 1.1 },
  h2: { fontSize: "28px", fontWeight: 600, lineHeight: 1.2 },
  h3: { fontSize: "22px", fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: "18px", fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: "16px", fontWeight: 400, lineHeight: 1.5 },
  "body-sm": { fontSize: "14px", fontWeight: 400, lineHeight: 1.4 },
  label: { fontSize: "14px", fontWeight: 500, lineHeight: 1.4 },
  caption: { fontSize: "12px", fontWeight: 400, lineHeight: 1.3 },
  overline: {
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
} as const;

// Legacy — kept for any remaining references, map to new scale
export const fontSizes = {
  extraSmall: "12px",
  small: "13px",
  standard: "14px",
  large: "16px",
  extraLarge: "18px",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
