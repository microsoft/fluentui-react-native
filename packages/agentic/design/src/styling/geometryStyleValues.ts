import type { ViewStyle } from 'react-native';

import type { FlexTokens } from '../flex/tokens.types';
import type { RadiusTrait, StrokeWidthTrait } from './traits.types';

type AxisScale<Axis extends string, Value extends string> = Value | { readonly [A in Axis]: Value };

function selectScaleValue<Axis extends string, Value extends string>(scale: AxisScale<Axis, Value>, axis: Axis | undefined): Value {
  return typeof scale === 'object' ? scale[axis as Axis] : scale;
}

/** Resolves a radius trait, or a radius scale for a size, to a style value; `none` paints square corners. */
export function getRadiusStyleValue(tokens: Pick<FlexTokens, 'borderRadius'>, radius: RadiusTrait): NonNullable<ViewStyle['borderRadius']>;
export function getRadiusStyleValue<Size extends string>(
  tokens: Pick<FlexTokens, 'borderRadius'>,
  radius: AxisScale<Size, RadiusTrait>,
  size: Size,
): NonNullable<ViewStyle['borderRadius']>;
export function getRadiusStyleValue<Size extends string>(
  tokens: Pick<FlexTokens, 'borderRadius'>,
  radius: AxisScale<Size, RadiusTrait>,
  size?: Size,
): NonNullable<ViewStyle['borderRadius']> {
  const role = selectScaleValue(radius, size);
  return role === 'none' ? 0 : tokens.borderRadius[role];
}

/** Resolves a stroke width trait, or a stroke width scale for a variant, to a style value; `none` paints no stroke. */
export function getStrokeWidthStyleValue(
  tokens: Pick<FlexTokens, 'strokeWidth'>,
  width: StrokeWidthTrait,
): NonNullable<ViewStyle['borderWidth']>;
export function getStrokeWidthStyleValue<Variant extends string>(
  tokens: Pick<FlexTokens, 'strokeWidth'>,
  width: AxisScale<Variant, StrokeWidthTrait>,
  variant: Variant,
): NonNullable<ViewStyle['borderWidth']>;
export function getStrokeWidthStyleValue<Variant extends string>(
  tokens: Pick<FlexTokens, 'strokeWidth'>,
  width: AxisScale<Variant, StrokeWidthTrait>,
  variant?: Variant,
): NonNullable<ViewStyle['borderWidth']> {
  const role = selectScaleValue(width, variant);
  return role === 'none' ? 0 : tokens.strokeWidth[role];
}
