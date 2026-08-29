import type { FlexTokens } from '../tokens/flex.types';
import type { ResolvedThemeAppearance, ThemeAppearanceOptions, ThemeAppearanceSource } from './appearance.types';
import type { PartialTheme, Theme } from './types/Theme.types';

export type OnThemeChange = () => void;

export interface ThemeSourceBase {
  readonly revision: number;
  readonly appearanceOptions?: ThemeAppearanceOptions;
  readonly fallbackAppearance?: Partial<ResolvedThemeAppearance>;
  readonly appearanceSource?: ThemeAppearanceSource;
  addOnThemeChanged(listener: OnThemeChange): void;
  removeOnThemeChanged(listener: OnThemeChange): void;
}

export interface LegacyThemeSource extends ThemeSourceBase {
  readonly kind: 'legacy';
  resolveTheme(appearance: ResolvedThemeAppearance): Theme;
}

export interface FlexThemeSource extends ThemeSourceBase {
  readonly kind: 'flex';
  resolveFlexTokens(appearance: ResolvedThemeAppearance): FlexTokens;
  resolveLegacyFallback?(appearance: ResolvedThemeAppearance): Theme | PartialTheme | undefined;
}

export type ThemeSource = LegacyThemeSource | FlexThemeSource;

export function isThemeSource(value: unknown): value is ThemeSource {
  return (
    typeof value === 'object' &&
    value !== null &&
    ((value as { kind?: unknown }).kind === 'legacy' || (value as { kind?: unknown }).kind === 'flex')
  );
}

const rawThemeSources = new WeakMap<Theme, LegacyThemeSource>();

export function legacyThemeSourceFromTheme(theme: Theme): LegacyThemeSource {
  let source = rawThemeSources.get(theme);
  if (!source) {
    source = {
      kind: 'legacy',
      revision: 0,
      appearanceOptions: undefined,
      fallbackAppearance: undefined,
      appearanceSource: undefined,
      resolveTheme: () => theme,
      addOnThemeChanged: () => undefined,
      removeOnThemeChanged: () => undefined,
    };
    rawThemeSources.set(theme, source);
  }
  return source;
}
