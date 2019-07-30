import { ITheme, IPartialTheme } from './Theme.types';
import { resolvePartialPalette } from './Color';
import { resolvePartialTypography } from './Typography';
import { mergeSettingsCollection } from '@uifabric/theme-settings';

/**
 * Resolve `partialTheme` into a fully specified theme, using `theme` to fill
 * in any missing values.
 */
export function resolvePartialTheme(theme: ITheme, partialTheme?: IPartialTheme): ITheme {
  if (!partialTheme) {
    return { ...theme };
  }

  //  start with a copy of the full theme, and merge in the partial theme.
  const merged: ITheme = {
    ...theme,
    palette: resolvePartialPalette(theme.palette, partialTheme.palette),
    typography: resolvePartialTypography(theme.typography, partialTheme.typography),
    settings: mergeSettingsCollection(theme.settings, partialTheme.settings),
    spacing: partialTheme.spacing ? { ...theme.spacing, ...partialTheme.spacing } : theme.spacing
  };

  return merged;
}
