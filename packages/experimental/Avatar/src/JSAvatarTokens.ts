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
      borderColor: t.colors.defaultBorder,
    },
    brand: {
      backgroundColor: t.colors.brandBackgroundStatic,
      color: t.colors.neutralForegroundOnBrand,
      borderColor: t.colors.brandedBorder,
    },
    darkRed: {
      backgroundColor: globalTokens.color.darkRed.tint40,
      color: globalTokens.color.darkRed.shade30,
      borderColor: globalTokens.color.darkRed.primary,
    },
    cranberry: {
      backgroundColor: globalTokens.color.cranberry.tint40,
      color: globalTokens.color.cranberry.shade30,
      borderColor: globalTokens.color.cranberry.primary,
    },
    red: {
      backgroundColor: globalTokens.color.red.tint40,
      color: globalTokens.color.red.shade30,
      borderColor: globalTokens.color.red.primary,
    },
    pumpkin: {
      backgroundColor: globalTokens.color.pumpkin.tint40,
      color: globalTokens.color.pumpkin.shade30,
      borderColor: globalTokens.color.pumpkin.primary,
    },
    peach: {
      backgroundColor: globalTokens.color.peach.tint40,
      color: globalTokens.color.peach.shade30,
      borderColor: globalTokens.color.peach.primary,
    },
    marigold: {
      backgroundColor: globalTokens.color.marigold.tint40,
      color: globalTokens.color.marigold.shade30,
      borderColor: globalTokens.color.marigold.primary,
    },
    gold: {
      backgroundColor: globalTokens.color.gold.tint40,
      color: globalTokens.color.gold.shade30,
      borderColor: globalTokens.color.gold.primary,
    },
    brass: {
      backgroundColor: globalTokens.color.brass.tint40,
      color: globalTokens.color.brass.shade30,
      borderColor: globalTokens.color.brass.primary,
    },
    brown: {
      backgroundColor: globalTokens.color.brown.tint40,
      color: globalTokens.color.brown.shade30,
      borderColor: globalTokens.color.brown.primary,
    },
    forest: {
      backgroundColor: globalTokens.color.forest.tint40,
      color: globalTokens.color.forest.shade30,
      borderColor: globalTokens.color.forest.primary,
    },
    seafoam: {
      backgroundColor: globalTokens.color.seafoam.tint40,
      color: globalTokens.color.seafoam.shade30,
      borderColor: globalTokens.color.seafoam.primary,
    },
    darkGreen: {
      backgroundColor: globalTokens.color.darkGreen.tint40,
      color: globalTokens.color.darkGreen.shade30,
      borderColor: globalTokens.color.darkGreen.primary,
    },
    lightTeal: {
      backgroundColor: globalTokens.color.lightTeal.tint40,
      color: globalTokens.color.lightTeal.shade30,
      borderColor: globalTokens.color.lightTeal.primary,
    },
    teal: {
      backgroundColor: globalTokens.color.teal.tint40,
      color: globalTokens.color.teal.shade30,
      borderColor: globalTokens.color.teal.primary,
    },
    steel: {
      backgroundColor: globalTokens.color.steel.tint40,
      color: globalTokens.color.steel.shade30,
      borderColor: globalTokens.color.steel.primary,
    },
    blue: {
      backgroundColor: globalTokens.color.blue.tint40,
      color: globalTokens.color.blue.shade30,
      borderColor: globalTokens.color.blue.primary,
    },
    royalBlue: {
      backgroundColor: globalTokens.color.royalBlue.tint40,
      color: globalTokens.color.royalBlue.shade30,
      borderColor: globalTokens.color.royalBlue.primary,
    },
    cornflower: {
      backgroundColor: globalTokens.color.cornflower.tint40,
      color: globalTokens.color.cornflower.shade30,
      borderColor: globalTokens.color.cornflower.primary,
    },
    navy: {
      backgroundColor: globalTokens.color.navy.tint40,
      color: globalTokens.color.navy.shade30,
      borderColor: globalTokens.color.navy.primary,
    },
    lavender: {
      backgroundColor: globalTokens.color.lavender.tint40,
      color: globalTokens.color.lavender.shade30,
      borderColor: globalTokens.color.lavender.primary,
    },
    purple: {
      backgroundColor: globalTokens.color.purple.tint40,
      color: globalTokens.color.purple.shade30,
      borderColor: globalTokens.color.purple.primary,
    },
    grape: {
      backgroundColor: globalTokens.color.grape.tint40,
      color: globalTokens.color.grape.shade30,
      borderColor: globalTokens.color.grape.primary,
    },
    lilac: {
      backgroundColor: globalTokens.color.lilac.tint40,
      color: globalTokens.color.lilac.shade30,
      borderColor: globalTokens.color.lilac.primary,
    },
    pink: {
      backgroundColor: globalTokens.color.pink.tint40,
      color: globalTokens.color.pink.shade30,
      borderColor: globalTokens.color.pink.primary,
    },
    magenta: {
      backgroundColor: globalTokens.color.magenta.tint40,
      color: globalTokens.color.magenta.shade30,
      borderColor: globalTokens.color.magenta.primary,
    },
    plum: {
      backgroundColor: globalTokens.color.plum.tint40,
      color: globalTokens.color.plum.shade30,
      borderColor: globalTokens.color.plum.primary,
    },
    beige: {
      backgroundColor: globalTokens.color.beige.tint40,
      color: globalTokens.color.beige.shade30,
      borderColor: globalTokens.color.beige.primary,
    },
    mink: {
      backgroundColor: globalTokens.color.mink.tint40,
      color: globalTokens.color.mink.shade30,
      borderColor: globalTokens.color.mink.primary,
    },
    platinum: {
      backgroundColor: globalTokens.color.platinum.tint40,
      color: globalTokens.color.platinum.shade30,
      borderColor: globalTokens.color.platinum.primary,
    },
    anchor: {
      backgroundColor: globalTokens.color.anchor.tint40,
      color: globalTokens.color.anchor.shade30,
      borderColor: globalTokens.color.anchor.primary,
    },
  } as JSAvatarTokens);
