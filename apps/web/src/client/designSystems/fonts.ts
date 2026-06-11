export const fontSizes = {
  extraSmall: "10px",
  small: "12px",
  standard: "14px",
  large: "16px",
  extraLarge: "20px",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
};

export const lineHeights = {
  extraSmall: "14px",
  small: "16px",
  standard: "20px",
  large: "22px",
  extraLarge: "28px",
} as const;

export const fonts = {
  // Extra Small - 10px
  extraSmallRegular: {
    fontSize: fontSizes.extraSmall,
    lineHeight: lineHeights.extraSmall,
    fontWeight: fontWeight.regular,
  },
  extraSmallMedium: {
    fontSize: fontSizes.extraSmall,
    lineHeight: lineHeights.extraSmall,
    fontWeight: fontWeight.medium,
  },
  extraSmallBold: {
    fontSize: fontSizes.extraSmall,
    lineHeight: lineHeights.extraSmall,
    fontWeight: fontWeight.bold,
  },

  // Small - 12px
  smallRegular: {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeight.regular,
  },
  smallMedium: {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeight.medium,
  },
  smallBold: {
    fontSize: fontSizes.small,
    lineHeight: lineHeights.small,
    fontWeight: fontWeight.bold,
  },

  // Standard - 14px
  standardRegular: {
    fontSize: fontSizes.standard,
    lineHeight: lineHeights.standard,
    fontWeight: fontWeight.regular,
  },
  standardMedium: {
    fontSize: fontSizes.standard,
    lineHeight: lineHeights.standard,
    fontWeight: fontWeight.medium,
  },
  standardBold: {
    fontSize: fontSizes.standard,
    lineHeight: lineHeights.standard,
    fontWeight: fontWeight.bold,
  },

  // Large - 16px
  largeRegular: {
    fontSize: fontSizes.large,
    lineHeight: lineHeights.large,
    fontWeight: fontWeight.regular,
  },
  largeMedium: {
    fontSize: fontSizes.large,
    lineHeight: lineHeights.large,
    fontWeight: fontWeight.medium,
  },
  largeBold: {
    fontSize: fontSizes.large,
    lineHeight: lineHeights.large,
    fontWeight: fontWeight.bold,
  },

  // Extra Large - 20px
  extraLargeRegular: {
    fontSize: fontSizes.extraLarge,
    lineHeight: lineHeights.extraLarge,
    fontWeight: fontWeight.regular,
  },
  extraLargeMedium: {
    fontSize: fontSizes.extraLarge,
    lineHeight: lineHeights.extraLarge,
    fontWeight: fontWeight.medium,
  },
  extraLargeBold: {
    fontSize: fontSizes.extraLarge,
    lineHeight: lineHeights.extraLarge,
    fontWeight: fontWeight.bold,
  },
};
