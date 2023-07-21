import type * as React from 'react';
import type { ViewStyle, ColorValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { IFocusable, PressableState, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type {
  FontTokens,
  IBackgroundColorTokens,
  IBorderTokens,
  IForegroundColorTokens,
  LayoutTokens,
} from '@fluentui-react-native/tokens';

import type { TabIndicatorProps } from '../TabIndicator/TabIndicator.types';

export const tabName = 'Tab';

export interface TabTokens extends FontTokens, IBorderTokens, IForegroundColorTokens, IBackgroundColorTokens, LayoutTokens {
  /**
   * Horizontal margin of the tab text.
   */
  contentMarginHorizontal?: number;

  /**
   * Controls order and direction of tab content and indicator.
   */
  flexDirection?: ViewStyle['flexDirection'];

  /**
   * The indicator color.
   */
  indicatorColor?: ColorValue;

  /**
   * The horizontal / vertical margin of the indicator, depending on its orientation.
   */
  indicatorInset?: number;

  /**
   * The direction the indicator is laying.
   */
  indicatorOrientation?: 'horizontal' | 'vertical';

  /**
   * Thickness of the indicator line.
   */
  indicatorThickness?: number;

  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * If there is Tab content, this is the margin of the icon relative to the content.
   */
  iconMargin?: number;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * Horizontal margin of the icon + content.
   */
  stackMarginHorizontal?: number;

  /**
   * Vertical margin of the icon + content.
   */
  stackMarginVertical?: number;

  /**
   * States that can be applied to a button
   */
  small?: TabTokens;
  medium?: TabTokens;
  large?: TabTokens;
  vertical?: TabTokens;
  transparent?: TabTokens;
  subtle?: TabTokens;
  hovered?: TabTokens;
  focused?: TabTokens;
  pressed?: TabTokens;
  disabled?: TabTokens;
  selected?: TabTokens;
}

export interface TabProps extends Omit<PressablePropsExtended, 'onPress'> {
  /**
   * A unique key-identifier for each option
   */
  tabKey: string;

  /**
   * Whether or not the tab is selectable
   */
  disabled?: boolean;

  /**
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconProps;

  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  testID?: string;
}

export interface TabState extends PressableState {
  selected?: boolean;
}

export interface TabInfo {
  props: TabProps & React.ComponentPropsWithRef<any>;
  state: TabState;
}

export interface TabSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  icon: IconProps;
  stack: IViewProps;
  indicator: TabIndicatorProps;
  content: TextProps;
}

export interface TabType {
  props: TabProps;
  tokens: TabTokens;
  slotProps: TabSlotProps;
  state: TabState;
}
