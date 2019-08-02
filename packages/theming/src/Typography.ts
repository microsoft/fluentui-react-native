import { FontFamilyValue, FontFamily, FontSizeValuePoints, FontSize, FontWeightValue, FontWeight, ITypography } from './Typography.types';

export function resolveFontFamily(typography: ITypography, family: FontFamily): FontFamilyValue {
  if (typography.families.hasOwnProperty(family)) {
    return typography.families[family];
  }
  return family as FontFamilyValue;
}

export function resolveFontSize(typography: ITypography, size: FontSize): FontSizeValuePoints {
  if (typography.sizes.hasOwnProperty(size)) {
    return typography.sizes[size];
  }
  return size as FontSizeValuePoints;
}

export function resolveFontWeight(typography: ITypography, weight: FontWeight): FontWeightValue {
  if (typography.weights.hasOwnProperty(weight)) {
    return typography.weights[weight];
  }
  return weight as FontWeightValue;
}
