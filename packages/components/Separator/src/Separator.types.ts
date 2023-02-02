import type { ViewProps, ColorValue } from 'react-native';

export const separatorName = 'Separator';

export const SeparatorInsetSpacings = [0, 16, 56, 68, 72, 108] as const;

export type SeparatorInsetSpacing = (typeof SeparatorInsetSpacings)[number];

export interface SeparatorPropTokens {
  /**
   * Specifies whether the separator is vertical or horizontal. If true, then it's vertical.
   * @defaultValue 'false'
   */
  vertical?: boolean;

  /**
   * Inset Spacing in 'dp' (density-independent pixels) on Android and 'points' on iOS.
   *
   * Inset Spacing is restricted to a limited set of supported values recommended for most uses (see `SeparatorInsetSpacing`) and
   * based on design guidelines for the Separator control.
   * @platform Android iOS
   * @defaultvalue 0
   */
  insetSpacing?: SeparatorInsetSpacing;
}

export interface SeparatorTokens extends SeparatorPropTokens {
  /**
   * Specifies the width of the separator. This will be interpreted as DIPs on Windows and Android, but as points on Mac and iOS.
   * @defaultValue 1
   */
  separatorWidth?: number;

  /**
   * Specifies the color of the separator
   */
  color?: ColorValue;
}

export interface SeparatorProps extends ViewProps, SeparatorPropTokens {
  /**
   * Specifies where the text or image should be aligned in the separator, when the separator has a text or image label.
   * @defaultValue 'center'
   * Not yet supported
   */
  // alignContent?: 'start' | 'center' | 'end';
}

export interface SeperatorSlotProps {
  root: ViewProps;
}

export interface SeparatorType {
  props: SeparatorProps;
  slotProps: SeperatorSlotProps;
  tokens: SeparatorTokens;
}
