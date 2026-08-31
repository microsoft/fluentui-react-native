/** Fallback surface colors used to resolve translucent validation pairs. */
export const MODE_SURFACE = {
  light: '#ffffff',
  dark: '#000000',
} as const;

/** WCAG 2.1 contrast thresholds used by the canonical color pairings. */
export const WCAG = {
  aaText: 4.5,
  aaLargeText: 3,
  aaaText: 7,
  aaaLargeText: 4.5,
  visibleStroke: 3,
} as const;
