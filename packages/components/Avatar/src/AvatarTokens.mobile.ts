import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { AvatarTokens } from '.';

export const defaultAvatarTokens: TokenSettings<AvatarTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.neutralForeground3,
    backgroundColor: t.colors.neutralBackground5,
    avatarOpacity: 1,
    fontFamily: t.typography.variants.body1.face,
    iconColor: t.colors.neutralForeground2,
    ringBackgroundColor: t.colors.neutralBackground1,
    ringColor: t.colors.neutralStroke1,
    borderColor: 'white',
    circular: {
      borderRadius: globalTokens.corner.radiusCircular,
    },
    size: 24,
    badgeSize: 'small',
    badgeY: -1 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
    badgeX: 1 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
    iconSize: 16,
    fontSize: globalTokens.font.size100,
    fontWeight: globalTokens.font.weight.regular,
    square: {
      borderRadius: globalTokens.corner.radius40,
    },
    // Badge is not shown for size 16 on Android.
    size16: {
      size: 16,
      iconSize: 12,
      fontSize: globalTokens.font.size100,
      fontWeight: globalTokens.font.weight.regular,
      square: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    size20: {
      size: 20,
      badgeSize: 'small',
      badgeY: -3 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 0 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 16,
      fontSize: globalTokens.font.size100,
      fontWeight: globalTokens.font.weight.regular,
      square: {
        borderRadius: globalTokens.corner.radius40,
      },
    },
    size24: {
      size: 24,
      badgeSize: 'small',
      badgeY: -1 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 1 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 16,
      fontSize: globalTokens.font.size100,
      fontWeight: globalTokens.font.weight.regular,
      square: {
        borderRadius: globalTokens.corner.radius40,
      },
    },
    size32: {
      size: 32,
      badgeSize: 'small',
      badgeY: 0 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 0 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 20,
      fontSize: globalTokens.font.size200,
      fontWeight: globalTokens.font.weight.regular,
      square: {
        borderRadius: globalTokens.corner.radius40,
      },
    },
    size40: {
      size: 40,
      badgeSize: 'medium',
      badgeY: 0 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 0 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 24,
      fontSize: globalTokens.font.size300,
      fontWeight: globalTokens.font.weight.regular,
      square: {
        borderRadius: globalTokens.corner.radius80,
      },
    },
    size56: {
      size: 56,
      badgeSize: 'medium',
      badgeY: 2 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 2 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 32,
      fontSize: globalTokens.font.size500,
      fontWeight: globalTokens.font.weight.medium,
      square: {
        borderRadius: globalTokens.corner.radius80,
      },
    },
    size72: {
      size: 72,
      badgeSize: 'large',
      badgeY: 3 - globalTokens.stroke.width20, // width20 subtracted to accomodate border width of presence badge
      badgeX: 3 - globalTokens.stroke.width20, // sign negated to flip x-axis based on design assumption
      iconSize: 48,
      fontSize: globalTokens.font.size700,
      fontWeight: globalTokens.font.weight.medium,
      square: {
        borderRadius: globalTokens.corner.radius120,
      },
    },
    neutral: {
      color: t.colors.neutralForeground3,
      iconColor: t.colors.neutralForeground3,
      ringColor: t.colors.transparentStroke,
    },
    brand: {
      backgroundColor: t.colors.brandBackground,
      color: t.colors.neutralForegroundOnColor,
      iconColor: t.colors.neutralForegroundOnBrand,
      ringColor: t.colors.brandStroke1,
    },
    brandInverted: {
      backgroundColor: t.colors.neutralBackground1,
      iconColor: t.colors.brandForeground1,
      ringColor: t.colors.brandStroke1,
    },
    accent: {
      backgroundColor: t.host.appearance === 'light' ? t.colors.brandBackgroundTint : t.colors.neutralBackground1,
      iconColor: t.colors.brandForeground1,
      ringColor: t.colors.brandStroke1,
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
  }) as AvatarTokens;

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
        backgroundColor: globalTokens.color[color].tint40,
        color: globalTokens.color[color].shade30,
        iconColor: globalTokens.color[color].shade30,
        ringColor: globalTokens.color[color].tint20,
      };
  }
}
