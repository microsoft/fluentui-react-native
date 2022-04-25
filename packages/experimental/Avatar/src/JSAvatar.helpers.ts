import { AvatarSize, AvatarColor, JSAvatarTokens } from './JSAvatar.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

const sizeAdjustment = {
  small: 8,
  medium: 12,
  large: 16,
};

export type AvatarSizeConfig = {
  physicalSize: number;
  iconSize: number;
  iconStrokeWidth: number;
  initialsSize: number;
};

const sizeTable: { [P in AvatarSize]: AvatarSizeConfig } = {
  size20: { physicalSize: 20, iconSize: 10, iconStrokeWidth: 2, initialsSize: 16 },
  size24: { physicalSize: 24, iconSize: 10, iconStrokeWidth: 2, initialsSize: 16 },
  size28: { physicalSize: 28, iconSize: 16, iconStrokeWidth: 2, initialsSize: 20 },
  size32: { physicalSize: 32, iconSize: 16, iconStrokeWidth: 2, initialsSize: 20 },
  size36: { physicalSize: 36, iconSize: 16, iconStrokeWidth: 2, initialsSize: 20 },
  size40: { physicalSize: 40, iconSize: 16, iconStrokeWidth: 2, initialsSize: 20 },
  size48: { physicalSize: 48, iconSize: 20, iconStrokeWidth: 2, initialsSize: 24 },
  size56: { physicalSize: 56, iconSize: 24, iconStrokeWidth: 3, initialsSize: 28 },
  size64: { physicalSize: 64, iconSize: 28, iconStrokeWidth: 3, initialsSize: 32 },
  size72: { physicalSize: 72, iconSize: 28, iconStrokeWidth: 4, initialsSize: 32 },
  size96: { physicalSize: 96, iconSize: 40, iconStrokeWidth: 4, initialsSize: 48 },
  size120: { physicalSize: 120, iconSize: 40, iconStrokeWidth: 4, initialsSize: 48 },
};

const colorTableFluent: { [P in AvatarColor]: string } = {
  cornflower: globalTokens.color.cornflower.primary,
  blue: globalTokens.color.blue.primary,
  royalBlue: globalTokens.color.royalBlue.primary,
  teal: globalTokens.color.teal.primary,
  forest: globalTokens.color.forest.primary,
  darkGreen: globalTokens.color.darkGreen.primary,
  berry: globalTokens.color.berry.primary,
  hotPink: globalTokens.color.hotPink.primary,
  grape: globalTokens.color.grape.primary,
  purple: globalTokens.color.purple.primary,
  pumpkin: globalTokens.color.pumpkin.primary,
  red: globalTokens.color.red.primary,
  burgundy: globalTokens.color.burgundy.primary,
  orchid: globalTokens.color.orchid.primary,
  brass: globalTokens.color.brass.primary,
  darkRed: globalTokens.color.darkRed.primary,
  beige: globalTokens.color.beige.primary,
  platinum: globalTokens.color.platinum.primary,
  steel: globalTokens.color.steel.primary,
  brown: globalTokens.color.brown.primary,
};

/**
 * Converts the AvatarColor into a hex color value
 */
export function convertCoinColorFluent(coinColor: AvatarColor): string {
  return colorTableFluent[coinColor];
}

export function calculateEffectiveSizes(tokens: JSAvatarTokens): AvatarSizeConfig {
  const { size, avatarSize, iconSize, iconStrokeWidth, initialsSize } = tokens;

  if (size) {
    return sizeTable[size];
  } else {
    const {
      physicalSize: defaultPhysicalSize,
      iconSize: defaultIconSize,
      iconStrokeWidth: defaultIconStrokeWidth,
      initialsSize: defaultInitialsSize,
    } = sizeTable['size40'];

    return {
      physicalSize: avatarSize || defaultPhysicalSize,
      iconSize: iconSize || defaultIconSize,
      iconStrokeWidth: iconStrokeWidth || defaultIconStrokeWidth,
      initialsSize: initialsSize || defaultInitialsSize,
    };
  }
}

export function getRingConfig(size: number): any {
  if (size <= 48) {
    return {
      size: size + sizeAdjustment.small,
      stroke: globalTokens.stroke.width.thick,
      innerStroke: globalTokens.stroke.width.thick,
    };
  }
  if (size <= 71) {
    return {
      size: size + sizeAdjustment.medium,
      stroke: globalTokens.stroke.width.thicker,
      innerStroke: globalTokens.stroke.width.thicker,
    };
  }
  return {
    size: size + sizeAdjustment.large,
    stroke: globalTokens.stroke.width.thickest,
    innerStroke: globalTokens.stroke.width.thickest,
  };
}
