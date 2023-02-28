import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import type { Typography, Variants } from '@fluentui-react-native/theme-types';

import { createFontAliasTokens } from './createFontAliasTokens';

export function win32Typography(): Typography {
  const win32Dict = {
    sizes: defaultFluentTheme.typography.sizes,
    weights: defaultFluentTheme.typography.weights,
    // hard coded until we support new fontFamily format
    families: {
      primary: 'Segoe UI',
      secondary: 'Segoe UI Semibold',
      cursive: 'System',
      monospace: 'Consolas',
      sansSerif: 'System',
      serif: 'System',
      numeric: 'Bahnschrift',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'primary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'primary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'primary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
      ...createFontAliasTokens(),
    } as Variants,
  };

  return win32Dict;
}
