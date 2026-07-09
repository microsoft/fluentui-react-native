import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius20,
  cornerRadius40,
  cornerRadius60,
  cornerRadius80,
  cornerRadiusCircular,
  fontSize100,
  fontSize200,
  fontSize400,
  fontSize500,
  fontSize700,
  fontSize900,
  fontWeightRegular,
  fontWeightSemibold,
} from '@fluentui-react-native/design/tokens/global';
import { isHighContrast } from '@fluentui-react-native/theming-utils';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { AvatarTokens } from '.';
import { getNamedColorSet, type NamedColorSet } from './Avatar.colors';

export const defaultAvatarTokens: TokenSettings<AvatarTokens, Theme> = (t: Theme) =>
  ({
    badgeSize: 'small',
    color: t.colors.neutralForeground3,
    backgroundColor: t.colors.neutralBackground6,
    avatarOpacity: 1,
    fontFamily: t.typography.families.primary,
    fontWeight: fontWeightSemibold,
    fontSize: fontSize200,
    size: 24,
    iconSize: 16,
    iconColor: t.colors.neutralForeground3,
    ringColor: t.colors.transparentStroke,
    borderColor: t.colors.neutralStroke1,
    borderWidth: isHighContrast() ? 1 : 0,
    circular: {
      borderRadius: cornerRadiusCircular,
    },
    square: {
      borderRadius: cornerRadius40,
    },
    inactive: {
      avatarOpacity: 0.8,
    },
    size20: {
      size: 20,
      badgeSize: 'tiny',
      iconSize: 16,
      fontSize: fontSize100,
      square: {
        borderRadius: cornerRadius20,
      },
    },
    size24: {
      size: 24,
      badgeSize: 'tiny',
      iconSize: 16,
      fontSize: fontSize100,
      square: {
        borderRadius: cornerRadius20,
      },
    },
    size28: {
      size: 28,
      badgeSize: 'extraSmall',
      iconSize: 20,
      fontWeight: fontWeightSemibold,
      fontSize: fontSize100,
    },
    size32: {
      size: 32,
      badgeSize: 'extraSmall',
      iconSize: 20,
      fontSize: fontSize100,
    },
    size36: {
      size: 36,
      badgeSize: 'extraSmall',
      iconSize: 20,
    },
    size40: {
      size: 40,
      badgeSize: 'small',
      iconSize: 20,
    },
    size48: {
      size: 48,
      badgeSize: 'small',
      iconSize: 24,
    },
    size56: {
      size: 56,
      badgeSize: 'medium',
      iconSize: 28,
      fontSize: fontSize400,
      square: {
        borderRadius: cornerRadius60,
      },
    },
    size64: {
      size: 64,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: fontSize500,
      square: {
        borderRadius: cornerRadius60,
      },
    },
    size72: {
      size: 72,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: fontSize500,
      square: {
        borderRadius: cornerRadius60,
      },
    },
    size96: {
      size: 96,
      badgeSize: 'extraLarge',
      iconSize: 48,
      fontWeight: fontWeightRegular,
      fontSize: fontSize700,
      square: {
        borderRadius: cornerRadius80,
      },
    },
    size120: {
      size: 120,
      badgeSize: 'extraLarge',
      iconSize: 48,
      fontWeight: fontWeightRegular,
      fontSize: fontSize900,
      square: {
        borderRadius: cornerRadius80,
      },
    },
    neutral: {
      backgroundColor: t.colors.neutralBackground6,
      color: t.colors.neutralForeground3,
      iconColor: t.colors.neutralForeground3,
      ringColor: t.colors.transparentStroke,
    },
    brand: {
      backgroundColor: t.colors.brandBackgroundStatic,
      color: t.colors.neutralForegroundOnBrand,
      iconColor: t.colors.neutralForegroundOnBrand,
      ringColor: t.colors.transparentStroke,
    },
    darkRed: getColorProps('darkRed', t),
    cranberry: getColorProps('cranberry', t),
    red: getColorProps('red', t),
    pumpkin: getColorProps('pumpkin', t),
    peach: getColorProps('peach', t),
    marigold: getColorProps('marigold', t),
    gold: getColorProps('gold', t),
    brass: getColorProps('brass', t),
    brown: getColorProps('brown', t),
    forest: getColorProps('forest', t),
    seafoam: getColorProps('seafoam', t),
    darkGreen: getColorProps('darkGreen', t),
    lightTeal: getColorProps('lightTeal', t),
    teal: getColorProps('teal', t),
    steel: getColorProps('steel', t),
    blue: getColorProps('blue', t),
    royalBlue: getColorProps('royalBlue', t),
    cornflower: getColorProps('cornflower', t),
    navy: getColorProps('navy', t),
    lavender: getColorProps('lavender', t),
    purple: getColorProps('purple', t),
    grape: getColorProps('grape', t),
    lilac: getColorProps('lilac', t),
    pink: getColorProps('pink', t),
    magenta: getColorProps('magenta', t),
    plum: getColorProps('plum', t),
    beige: getColorProps('beige', t),
    mink: getColorProps('mink', t),
    platinum: getColorProps('platinum', t),
    anchor: getColorProps('anchor', t),
    burgundy: getColorProps('burgundy', t),
    hotPink: getColorProps('hotPink', t),
    orchid: getColorProps('orchid', t),
  }) as AvatarTokens;

/**
 * A function which returns object of props depending on color and theme.
 * @param color
 * @param theme
 * @returns object of props - backgroundColor, color and ringColor
 */
function getColorProps(color: NamedColorSet, theme: Theme) {
  const colorSet = getNamedColorSet(color);
  const themeAppearance = theme.host.appearance;
  switch (themeAppearance) {
    case 'light':
    default:
      return {
        backgroundColor: colorSet.tint40,
        color: colorSet.shade30,
        iconColor: colorSet.shade30,
        ringColor: colorSet.primary,
      };
    case 'dark':
      return {
        backgroundColor: colorSet.shade30,
        color: colorSet.tint40,
        iconColor: colorSet.tint40,
        ringColor: colorSet.tint30,
      };
    case 'highContrast':
      return {
        backgroundColor: theme.colors.neutralBackground6,
        color: theme.colors.neutralForeground3,
        iconColor: theme.colors.neutralForeground3,
        ringColor: theme.colors.transparentStroke,
      };
  }
}
