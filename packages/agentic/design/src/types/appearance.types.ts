export type ThemeColorScheme = 'light' | 'dark';
export type ThemeContrast = 'standard' | 'highContrast';
export type ThemeInterfaceLevel = 'base' | 'elevated';

/**
 * Palette tone. It selects both the Flex palette and the interaction-color
 * algorithm. Tone is configuration only; no platform source reports it.
 */
export type ColorTone = 'cool' | 'warm';

export interface ThemeAppearanceRequest {
  colorScheme: ThemeColorScheme | 'system';
  contrast: ThemeContrast | 'system';
  interfaceLevel: ThemeInterfaceLevel | 'system';
  /**
   * Explicit tone request. Omission is preserved until resolution, where the
   * configured fallback tone and then cool apply.
   */
  colorTone?: ColorTone;
}

export type ThemeAppearanceOptions = Partial<ThemeAppearanceRequest>;

/**
 * A concrete appearance accepted by legacy-facing and recipe APIs. Existing
 * three-field values remain valid; an omitted tone means cool.
 */
export interface ResolvedThemeAppearance {
  colorScheme: ThemeColorScheme;
  contrast: ThemeContrast;
  interfaceLevel: ThemeInterfaceLevel;
  colorTone?: ColorTone;
}

/**
 * A resolved appearance produced by the theme runtime. Every axis, including
 * tone, is concrete.
 */
export interface NormalizedThemeAppearance extends ResolvedThemeAppearance {
  colorTone: ColorTone;
}

export interface ThemeAppearanceState {
  requested: Readonly<ThemeAppearanceRequest>;
  resolved: Readonly<NormalizedThemeAppearance>;
}

export interface ThemeAppearanceSourceSnapshot {
  colorScheme?: ThemeColorScheme | null;
  contrast?: ThemeContrast;
  interfaceLevel?: ThemeInterfaceLevel;
}

export interface ThemeAppearanceSource {
  getSnapshot(): ThemeAppearanceSourceSnapshot;
  subscribe(listener: () => void): () => void;
}

export interface ThemeAppearanceStore extends ThemeAppearanceSource {
  refresh(): void;
}
