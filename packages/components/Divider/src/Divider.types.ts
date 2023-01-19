import { ViewStyle, ViewProps, ColorValue } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IForegroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { TextProps } from '@fluentui-react-native/text';

export const divider = 'Divider';

export const DividerInsetSizes = [0, 16, 56, 68, 72, 108] as const;
export type DividerInsetSize = typeof DividerInsetSizes[number];

export interface DividerProps {
  alignContent?: 'start' | 'center' | 'end';
  appearance?: 'default' | 'subtle' | 'brand' | 'strong';
  color?: ColorValue;
  icon?: IconSourcesType;
  inset?: boolean;
  text?: string;
  vertical?: boolean;
}

export interface DividerCoreTokens extends LayoutTokens, IForegroundColorTokens {
  alignment?: ViewStyle['justifyContent'];
  color?: ColorValue;
  contentColor?: ColorValue;
  contentMarginHorizontal?: number;
  contentMarginVertical?: number;
  height?: ViewStyle['height'];
  insetStyleProp?: 'paddingHorizontal' | 'paddingVertical';
  insetSize?: DividerInsetSize;
  lineAfterFlex?: number;
  lineBeforeFlex?: number;
  lineColor?: ColorValue;
  lineStyleProp?: 'borderTopWidth' | 'borderLeftWidth';
  rootFlexDirection?: ViewStyle['flexDirection'];
  thickness?: number;
}

export interface DividerTokens extends DividerCoreTokens {
  /* States for the divider */
  alignStart?: DividerTokens;
  alignEnd?: DividerTokens;
  hasChildren?: DividerTokens;
  inset?: DividerTokens;
  vertical?: DividerTokens;
  /* States related to the appearance prop */
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
