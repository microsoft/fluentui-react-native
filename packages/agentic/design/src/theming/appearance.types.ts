export type ThemeColorScheme = 'light' | 'dark';
export type ThemeContrast = 'standard' | 'highContrast';
export type ThemeInterfaceLevel = 'base' | 'elevated';

export interface ThemeAppearanceRequest {
  colorScheme: ThemeColorScheme | 'system';
  contrast: ThemeContrast | 'system';
  interfaceLevel: ThemeInterfaceLevel | 'system';
}

export type ThemeAppearanceOptions = Partial<ThemeAppearanceRequest>;

export interface ResolvedThemeAppearance {
  colorScheme: ThemeColorScheme;
  contrast: ThemeContrast;
  interfaceLevel: ThemeInterfaceLevel;
}

export interface ThemeAppearanceState {
  requested: Readonly<ThemeAppearanceRequest>;
  resolved: Readonly<ResolvedThemeAppearance>;
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
