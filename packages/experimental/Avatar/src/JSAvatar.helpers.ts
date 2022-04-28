import { AvatarColor } from './JSAvatar.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

const sizeAdjustment = {
  small: 8,
  medium: 12,
  large: 16,
};

export type AvatarSizeConfig = {
  iconSize: number;
  iconStrokeWidth: number;
  initialsSize: number;
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
