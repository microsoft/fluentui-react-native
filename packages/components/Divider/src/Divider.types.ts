import { ViewStyle, ViewProps, ColorValue } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { LayoutTokens } from '@fluentui-react-native/tokens';
import { TextProps } from '@fluentui-react-native/text';

export const divider = 'Divider';

export const DividerInsetSizes = [0, 16, 56, 68, 72, 108] as const;
export type DividerInsetSize = typeof DividerInsetSizes[number];

export type DividerAlignment = 'start' | 'center' | 'end';
export type DividerAppearance = 'default' | 'subtle' | 'brand' | 'strong';

export interface DividerCoreProps {
  color?: ColorValue;
  inset?: boolean;
  vertical?: boolean;
}

export interface DividerProps extends DividerCoreProps {
  alignContent?: DividerAlignment;
  appearance?: DividerAppearance;
  icon?: IconSourcesType;
  text?: string;
}

export interface DividerTokens extends DividerCoreProps, LayoutTokens {
  alignment?: ViewStyle['justifyContent'];
  contentColor?: ColorValue;
  contentPadding?: string | number;
  flexAfter?: number;
  flexBefore?: number;
  insetSize?: DividerInsetSize;
  lineColor?: ColorValue;
  thickness?: number;
  /* States */
  alignStart?: DividerTokens;
  alignEnd?: DividerTokens;
  hasChildren?: DividerTokens;
  isVertical?: DividerTokens;
  default?: DividerTokens;
  subtle?: DividerTokens;
  brand?: DividerTokens;
  strong?: DividerTokens;
}

export interface DividerSlotProps {
  root: ViewProps;
  beforeLine: ViewProps;
  afterLine: ViewProps;
  wrapper: ViewProps;
  text: TextProps;
  icon: IconProps;
}

export interface DividerType {
  props: DividerProps;
  tokens: DividerTokens;
  slotProps: DividerSlotProps;
}
