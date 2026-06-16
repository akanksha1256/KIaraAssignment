export const colors = {
  coral: {
    50: "#FFF5F1",
    100: "#FFE7DE",
    200: "#FFC9B7",
    500: "#FF6139",
    600: "#E84E27",
    700: "#C53F1E",
  },
  maroon: {
    500: "#8A4140",
    600: "#733635",
    700: "#5C2A29",
  },
  teal: {
    100: "#E9F2F2",
    200: "#CDE2E3",
    300: "#A1CACC",
    600: "#5E8E90",
    700: "#467173",
  },
  espresso: {
    300: "#B9A7A4",
    500: "#8B716E",
    700: "#5A3F3C",
    900: "#371F1D",
  },
  sand: {
    100: "#F3F4E9",
    200: "#EBECDC",
    400: "#D9DAC4",
  },
  cream: "#F5F5ED",
  // Status colours (light-mode hex approximations; OKLCH canonical in tokens.css)
  destructive: {
    DEFAULT: "#C8341B",
    bg: "#FCEBE7",
  },
  warning: {
    DEFAULT: "#C98A12",
    bg: "#FBF1DD",
  },
  info: "#5C7196",
  // Chart palette (draws from brand primitives)
  chart: {
    paid: "#467173",      // teal-700
    outstanding: "#C98A12", // warning
    overdue: "#C8341B",   // destructive
    expected: "#CDE2E3",  // teal-200
    collected: "#FF6139", // coral-500
  },
} as const;
