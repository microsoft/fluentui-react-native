import {
  FontFamilyValue,
  FontFamily,
  FontSizeValuePoints,
  FontSize,
  FontWeightValue,
  FontWeight,
  Typography,
} from '@fluentui-react-native/theme-types';

export function resolveFontFamily(typography: Typography, family: FontFamily): FontFamilyValue {
  if (typography.families.hasOwnProperty(family)) {
    return typography.families[family];
  }
  return family as FontFamilyValue;
}

export function resolveFontSize(typography: Typography, size: FontSize): FontSizeValuePoints {
  if (typography.sizes.hasOwnProperty(size)) {
    return typography.sizes[size];
  }
  return size as FontSizeValuePoints;
}

export function resolveFontWeight(typography: Typography, weight: FontWeight): FontWeightValue {
  if (typography.weights.hasOwnProperty(weight)) {
    return typography.weights[weight];
  }
  return weight as FontWeightValue;
}
