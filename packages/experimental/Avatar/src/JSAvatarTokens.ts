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
      iconSize: 10,
      initialsSize: 16,
    },
    size24: {
      width: 24,
      height: 24,
      badgeSize: 'smallest',
      iconSize: 10,
      initialsSize: 16,
    },
    size28: {
      width: 28,
      height: 28,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size32: {
      width: 32,
      height: 32,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size36: {
      width: 36,
      height: 36,
      badgeSize: 'smaller',
      iconSize: 16,
      initialsSize: 20,
    },
    size40: {
      width: 40,
      height: 40,
      badgeSize: 'small',
      iconSize: 16,
      initialsSize: 20,
    },
    size48: {
      width: 48,
      height: 48,
      badgeSize: 'small',
      iconSize: 20,
      initialsSize: 24,
    },
    size56: {
      width: 56,
      height: 56,
      badgeSize: 'medium',
      iconSize: 24,
      initialsSize: 28,
    },
    size64: {
      width: 64,
      height: 64,
      badgeSize: 'large',
      iconSize: 28,
      initialsSize: 32,
    },
    size72: {
      width: 72,
      height: 72,
      badgeSize: 'large',
      iconSize: 28,
      initialsSize: 32,
    },
    size96: {
      width: 96,
      height: 96,
      badgeSize: 'largest',
      iconSize: 40,
      initialsSize: 48,
    },
    size120: {
      width: 120,
      height: 120,
      badgeSize: 'largest',
      iconSize: 40,
      initialsSize: 48,
    },
    neutral: {
      backgroundColor: t.colors.neutralBackground6,
      color: t.colors.neutralForeground3,
      ringColor: t.colors.defaultBorder,
    },
    brand: {
      backgroundColor: t.colors.brandBackgroundStatic,
      color: t.colors.neutralForegroundOnBrand,
      ringColor: t.colors.brandedBorder,
    },
    darkRed: {
      backgroundColor: globalTokens.color.darkRed.primary,
    },
    cranberry: {
      backgroundColor: globalTokens.color.cranberry.primary,
    },
    red: {
      backgroundColor: globalTokens.color.red.primary,
    },
    pumpkin: {
      backgroundColor: globalTokens.color.pumpkin.primary,
    },
    peach: {
      backgroundColor: globalTokens.color.peach.primary,
    },
    marigold: {
      backgroundColor: globalTokens.color.marigold.primary,
    },
    gold: {
      backgroundColor: globalTokens.color.gold.primary,
    },
    brass: {
      backgroundColor: globalTokens.color.brass.primary,
    },
    brown: {
      backgroundColor: globalTokens.color.brown.primary,
    },
    forest: {
      backgroundColor: globalTokens.color.forest.primary,
    },
    seafoam: {
      backgroundColor: globalTokens.color.seafoam.primary,
    },
    darkGreen: {
      backgroundColor: globalTokens.color.darkGreen.primary,
    },
    lightTeal: {
      backgroundColor: globalTokens.color.lightTeal.primary,
    },
    teal: {
      backgroundColor: globalTokens.color.teal.primary,
    },
    steel: {
      backgroundColor: globalTokens.color.steel.primary,
    },
    blue: {
      backgroundColor: globalTokens.color.blue.primary,
    },
    royalBlue: {
      backgroundColor: globalTokens.color.royalBlue.primary,
    },
    cornflower: {
      backgroundColor: globalTokens.color.cornflower.primary,
    },
    navy: {
      backgroundColor: globalTokens.color.navy.primary,
    },
    lavender: {
      backgroundColor: globalTokens.color.lavender.primary,
    },
    purple: {
      backgroundColor: globalTokens.color.purple.primary,
    },
    grape: {
      backgroundColor: globalTokens.color.grape.primary,
    },
    lilac: {
      backgroundColor: globalTokens.color.lilac.primary,
    },
    pink: {
      backgroundColor: globalTokens.color.pink.primary,
    },
    magenta: {
      backgroundColor: globalTokens.color.magenta.primary,
    },
    plum: {
      backgroundColor: globalTokens.color.plum.primary,
    },
    beige: {
      backgroundColor: globalTokens.color.beige.primary,
    },
    mink: {
      backgroundColor: globalTokens.color.mink.primary,
    },
    platinum: {
      backgroundColor: globalTokens.color.platinum.primary,
    },
    anchor: {
      backgroundColor: globalTokens.color.anchor.primary,
    },
  } as JSAvatarTokens);
