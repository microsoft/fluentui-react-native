import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { JSAvatarTokens } from '.';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const defaultJSAvatarTokens: TokenSettings<JSAvatarTokens, Theme> = (t: Theme) =>
  ({
    horizontalIconAlignment: 'end',
    verticalIconAlignment: 'end',
    color: globalTokens.color.white,
    backgroundColor: globalTokens.color.cornflower.primary,
    avatarOpacity: 1,
    fontFamily: t.typography.families.primary,
    fontWeight: globalTokens.font.weight.semibold,
    fontSize: globalTokens.font.size[200],
    width: 24,
    height: 24,
    iconSize: 16,
    iconColor: globalTokens.color.white,
    ringColor: t.colors.transparentStroke,
    borderColor: globalTokens.color.white,
    borderWidth: t.name === 'HighContrast' ? 1 : 0,
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
      width: 20,
      height: 20,
      badgeSize: 'smallest',
      iconSize: 16,
      fontSize: globalTokens.font.size[100],
      square: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    size24: {
      width: 24,
      height: 24,
      badgeSize: 'smallest',
      iconSize: 16,
      fontSize: globalTokens.font.size[100],
      square: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    size28: {
      width: 28,
      height: 28,
      badgeSize: 'smaller',
      iconSize: 20,
      fontWeight: globalTokens.font.weight.semibold,
      fontSize: globalTokens.font.size[100],
    },
    size32: {
      width: 32,
      height: 32,
      badgeSize: 'smaller',
      iconSize: 20,
      fontSize: globalTokens.font.size[100],
    },
    size36: {
      width: 36,
      height: 36,
      badgeSize: 'smaller',
      iconSize: 20,
    },
    size40: {
      width: 40,
      height: 40,
      badgeSize: 'small',
      iconSize: 20,
    },
    size48: {
      width: 48,
      height: 48,
      badgeSize: 'small',
      iconSize: 24,
    },
    size56: {
      width: 56,
      height: 56,
      badgeSize: 'medium',
      iconSize: 28,
      fontSize: globalTokens.font.size[400],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size64: {
      width: 64,
      height: 64,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: globalTokens.font.size[500],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size72: {
      width: 72,
      height: 72,
      badgeSize: 'large',
      iconSize: 32,
      fontSize: globalTokens.font.size[500],
      square: {
        borderRadius: globalTokens.corner.radius.large,
      },
    },
    size96: {
      width: 96,
      height: 96,
      badgeSize: 'largest',
      iconSize: 48,
      fontWeight: globalTokens.font.weight.regular,
      fontSize: globalTokens.font.size[700],
      square: {
        borderRadius: globalTokens.corner.radius.extraLarge,
      },
    },
    size120: {
      width: 120,
      height: 120,
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
      ringColor: t.colors.transparentStroke,
    },
    brand: {
      backgroundColor: t.colors.brandBackgroundStatic,
      color: t.colors.neutralForegroundOnBrand,
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
  } as JSAvatarTokens);

/**
 * A function which returns object of props depending on color and theme.
 * @param color
 * @param theme
 * @returns object of props - backgroundColor, color and ringColor
 */
function getColorProps(color: string, theme: Theme) {
  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        backgroundColor: globalTokens.color[color].tint40,
        color: globalTokens.color[color].shade30,
        iconColor: globalTokens.color[color].shade30,
        ringColor: globalTokens.color[color].primary,
      };
    case 'DarkGray':
    case 'Black':
      return {
        backgroundColor: globalTokens.color[color].shade30,
        color: globalTokens.color[color].tint40,
        iconColor: globalTokens.color[color].tint40,
        ringColor: globalTokens.color[color].tint30,
      };
    case 'HighContrast':
      return {
        backgroundColor: theme.colors.neutralBackground6,
        color: theme.colors.neutralForeground3,
        iconColor: theme.colors.neutralForeground3,
        ringColor: theme.colors.transparentStroke,
      };
  }
}
