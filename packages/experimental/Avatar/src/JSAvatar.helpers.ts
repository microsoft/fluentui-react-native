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
