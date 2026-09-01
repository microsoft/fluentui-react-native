import type { FlexTokens } from '../../tokens/flex.types';
import { projectFlexToTheme } from '../../tokens/mappings/themeFromFlex.generated';
import { appearanceOptionFromResolved } from '../appearance';
import type { ResolvedThemeAppearance } from '../appearance.types';
import { mergeTheme } from '../mergeTheme';
import type { PartialTheme, Theme } from '../types/Theme.types';

import { getDefaultLegacyTheme } from './defaultLegacyTheme';

export interface ThemeFromFlexTokensOptions {
  fallback?: Theme | PartialTheme;
}

/**
 * Project Flex tokens into a complete legacy Theme.
 *
 * The compatibility base fills legacy-only values, the optional fallback adds
 * author or host metadata, mapped Flex values remain authoritative, and the
 * final host appearance reflects the resolved structured appearance.
 */
export function themeFromFlexTokens(
  tokens: FlexTokens,
  appearance: ResolvedThemeAppearance,
  options?: { fallback?: Theme | PartialTheme },
): Theme {
  let theme = getDefaultLegacyTheme(appearance);
  if (options?.fallback) {
    theme = mergeTheme(theme, options.fallback as PartialTheme);
  }
  theme = mergeTheme(theme, projectFlexToTheme(tokens));
  return mergeTheme(theme, {
    host: {
      appearance: appearanceOptionFromResolved(appearance),
    },
  });
}
