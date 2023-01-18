import { ViewStyle, ViewProps } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IForegroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { TextProps } from '@fluentui-react-native/text';

export const divider = 'Divider';

export const DividerInsetSizes = [0, 16, 56, 68, 72, 108] as const;
export type DividerInsetSize = typeof DividerInsetSizes[number];

export interface DividerProps {
  alignContent?: 'start' | 'center' | 'end';
  icon?: IconSourcesType;
  inset?: boolean;
  text?: string;
  vertical?: boolean;
}

export interface DividerTokens extends LayoutTokens, IForegroundColorTokens {
  alignment?: ViewStyle['justifyContent'];
  appearance?: 'default' | 'subtle' | 'brand' | 'strong';
  contentMarginHorizontal?: number;
  contentMarginVertical?: number;
  insetSize?: DividerInsetSize;
  lineAfterFlex?: number;
  lineBeforeFlex?: number;
  rootFlexDirection?: ViewStyle['flexDirection'];
  thickness?: number;
  /* States for the divider */
  alignStart?: DividerTokens;
  alignEnd?: DividerTokens;
  hasChildren?: DividerTokens;
  hasInset?: DividerTokens;
  vertical?: DividerTokens;
}

export interface DividerState {
  alignStart?: boolean;
  alignEnd?: boolean;
  hasChildren?: boolean;
  vertical?: boolean;
}

export interface DividerInfo {
  state: DividerState;
  props: DividerProps;
}

export interface DividerSlotProps {
  root: ViewProps;
  beforeLine: ViewProps;
  afterLine: ViewProps;
  text: TextProps;
  icon: IconProps;
}

export interface DividerType {
  props: DividerProps;
  tokens: DividerTokens;
  slotProps: DividerSlotProps;
}
