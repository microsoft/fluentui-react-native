import type * as React from 'react';
import type { ViewStyle, ColorValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { IFocusable, PressableState, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IBorderTokens } from '@fluentui-react-native/tokens';

export const tabName = 'Tab';

export interface TabTokens extends FontTokens, IBorderTokens {
  /**
   * The indicator color.
   */
  indicatorColor?: string;

  /**
   * The opacity of the Tab.
   */
  tabsItemOpacity?: number;

  /**
   * The indicator marginHorizontal value.
   */
  indicatorMarginHorizontal?: number;

  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * The amount of padding between the border and the headerText.
   */
  headerTextPadding?: number | string;

  /**
   * The amount of padding between the border and the headerText when the TabsItem has focus.
   */
  headerTextPaddingFocused?: number | string;
  /**
   * Background color for the button
   */
  backgroundColor?: ColorValue;

  /**
   * Foreground color for the text and/or icon of the button
   */
  color?: ColorValue;

  /**
   * The amount of padding between the border and the contents.
   */
  contentPadding?: number | string;

  /**
   * The amount of padding between the border and the contents when the Button has focus.
   */
  contentPaddingFocused?: number | string;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: ColorValue;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number | string;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  width?: ViewStyle['width'];
  minHeight?: ViewStyle['minHeight'];
  minWidth?: ViewStyle['minWidth'];

  /**
   * States that can be applied to a button
   */
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
  key: string;

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
  indicator: IViewProps;
  content: TextProps;
}

export interface TabType {
  props: TabProps;
  tokens: TabTokens;
  slotProps: TabSlotProps;
  state: TabState;
}
