import type { TextStyle } from 'react-native';

import type { FlexTokens } from '../flex/tokens.types';
import type { FunctionalTypographyRole, TypographyTraits } from './traits.types';

/**
 * Builds a functional text style for a role. Weight is omitted when `unowned`, and line height is painted only for
 * `token`.
 */
export function functionalTypography(
  { fontFamily, fontSize, fontWeight, lineHeight }: Pick<FlexTokens, 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight'>,
  role: FunctionalTypographyRole,
  traits: TypographyTraits,
): TextStyle {
  const style: TextStyle = { fontFamily: fontFamily.functional, fontSize: fontSize[role] };
  if (traits.weight !== 'unowned') {
    style.fontWeight = traits.weight === 'semibold' ? fontWeight.functionalSemibold : fontWeight.functionalRegular;
  }
  if (traits.lineHeight === 'token') {
    style.lineHeight = lineHeight[role];
  }
  return style;
}
