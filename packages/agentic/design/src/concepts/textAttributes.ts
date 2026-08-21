import {
  fontSize100,
  fontSize200,
  fontSize300,
  fontSize400,
  fontSize500,
  fontSize600,
  fontSize700,
  fontSize800,
  fontSize900,
  fontSize1000,
  fontWeightSemibold,
  fontWeightRegular,
  fontWeightMedium,
  fontWeightBold,
} from '../tokens/global.generated';

/**
 * Represents the available font sizes for this platform. Available via key lookup
 */
export type FontSize = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;

/**
 * Represents the available font weights for this platform. Available via key lookup
 */
export type FontWeight = 'bold' | 'medium' | 'regular' | 'semibold';

/**
 * Get the size value associated with a named font size for this platform
 * @param size The font size key to retrieve from the FONT_SIZES mapping.
 * @param defaultSize The default font size key to use if the specified size is not found.
 * @returns The corresponding font size value from the FONT_SIZES mapping.
 */
export const fontSize = (() => {
  let fontSizes: Record<FontSize, number>;
  return (size: FontSize, defaultSize: FontSize = 300) => {
    // initialize fontSizes one time when used
    fontSizes ??= {
      100: fontSize100,
      200: fontSize200,
      300: fontSize300,
      400: fontSize400,
      500: fontSize500,
      600: fontSize600,
      700: fontSize700,
      800: fontSize800,
      900: fontSize900,
      1000: fontSize1000,
    };
    return fontSizes[size] ?? fontSizes[defaultSize];
  };
})();

/**
 * Get the weight value associated with a named font weight for this platform
 * @param weight The font weight key to retrieve from the FONT_WEIGHTS mapping.
 * @param defaultWeight The default font weight key to use if the specified weight is not found.
 * @returns The corresponding font weight value from the FONT_WEIGHTS mapping.
 */
export const fontWeight = (() => {
  let fontWeights: Record<FontWeight, string>;
  return (weight: FontWeight, defaultWeight: FontWeight = 'regular') => {
    // initialize fontWeights one time when used
    fontWeights ??= {
      bold: fontWeightBold,
      medium: fontWeightMedium,
      regular: fontWeightRegular,
      semibold: fontWeightSemibold,
    };
    return fontWeights[weight] ?? fontWeights[defaultWeight];
  };
})();
