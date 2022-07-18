import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { AvatarTokens } from '.';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultAvatarTokens: TokenSettings<AvatarTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.neutralForeground3,
    backgroundColor: t.colors.neutralBackground6,
    avatarOpacity: 1,
    fontFamily: t.typography.families.primary,
    fontWeight: globalTokens.font.weight.semibold,
    fontSize: globalTokens.font.size[200],
    size: 24,
    iconSize: 16,
    iconColor: t.colors.neutralForeground3,
    ringColor: t.colors.transparentStroke,
    borderColor: t.colors.neutralStroke1,
    borderWidth: t.host.appearance === 'highContrast' ? 1 : 0,
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
    },
    square: {
      borderRadius: globalTokens.corner.radius.medium,
    },
    inactive: {
      avatarOpacity: 0.8,
    },
    size20: {
      size: 20,
      badgeSize: 'smallest',
      iconSize: 16,
      fontSize: globalTokens.font.size[100],
      square: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    size24: {
      size: 24,
      badgeSize: 'smallest',
      iconSize: 16,
      fontSize: globalTokens.font.size[100],
      square: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    size28: {
      size: 28,
      badgeSize: 'smaller',
      iconSize: 20,
      fontWeight: globalTokens.font.weight.semibold,
      fontSize: globalTokens.font.size[100],
    },
    size32: {
      size: 32,
      badgeSize: 'smaller',
      iconSize: 20,
      fontSize: globalTokens.font.size[100],
    },
    size36: {
      size: 36,
      badgeSize: 'smaller',
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
      fontSize: globalTokens.font.size[400],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size64: {
      size: 64,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: globalTokens.font.size[500],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size72: {
      size: 72,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: globalTokens.font.size[500],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size96: {
      size: 96,
      badgeSize: 'largest',
      iconSize: 48,
      fontWeight: globalTokens.font.weight.regular,
      fontSize: globalTokens.font.size[700],
      square: {
        borderRadius: globalTokens.corner.radius.extraLarge,
      },
    },
    size120: {
      size: 120,
      badgeSize: 'largest',
      iconSize: 48,
      fontWeight: globalTokens.font.weight.regular,
      fontSize: globalTokens.font.size[900],
      square: {
        borderRadius: globalTokens.corner.radius.extraLarge,
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
  } as AvatarTokens);

/**
 * A function which returns object of props depending on color and theme.
 * @param color
 * @param theme
 * @returns object of props - backgroundColor, color and ringColor
 */
function getColorProps(color: string, theme: Theme) {
  const themeAppearance = theme.host.appearance;
  switch (themeAppearance) {
    case 'light':
    default:
      return {
        backgroundColor: globalTokens.color[color].tint40,
        color: globalTokens.color[color].shade30,
        iconColor: globalTokens.color[color].shade30,
        ringColor: globalTokens.color[color].primary,
      };
    case 'dark':
      return {
        backgroundColor: globalTokens.color[color].shade30,
        color: globalTokens.color[color].tint40,
        iconColor: globalTokens.color[color].tint40,
        ringColor: globalTokens.color[color].tint30,
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
