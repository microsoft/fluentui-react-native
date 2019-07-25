import {
  FontFamilyValue,
  FontFamily,
  FontSizeValuePoints,
  FontSize,
  FontWeightValue,
  FontWeight,
  ITypography,
  IPartialTypography
} from './Typography.types';

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

/**
 * Resolve `partialTypography` into a fully specified typography using
 * `typography` to fill in any missing values.
 */
export function resolvePartialTypography(typography: ITypography, partialTypography?: IPartialTypography): ITypography {
  if (!partialTypography) {
    return typography;
  }

  //  start with a copy of the full typography, and merge in the partial
  //  typography.
  const merged: ITypography = Object.assign({}, typography);
  for (const key of Object.getOwnPropertyNames(merged)) {
    if (partialTypography.hasOwnProperty(key) && partialTypography[key]) {
      merged[key] = Object.assign({}, typography[key], partialTypography[key]);
    }
  }

  return merged;
}
