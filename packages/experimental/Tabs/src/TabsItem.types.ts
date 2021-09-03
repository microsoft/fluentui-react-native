import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IWithPressableEvents, IPressableState, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { IconProps } from '@fluentui-react-native/icon';

export const tabsItemName = 'TabsItem';
type IconSourcesType = number | string | IconProps;

export interface TabsItemTokens extends FontTokens, IBorderTokens {
  /**
   * The indicator color.
   */
  indicatorColor?: string;

  /**
   * The indicator marginHorizontal value.
   */
  marginHorizontal?: number;

  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * Source URL or name of the icon to show on the TabsItem.
   */
  icon?: IconSourcesType;

  /**
   * Text to show on the TabsItem.
   */
  headerText?: string;

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
  hovered?: TabsItemTokens;
  focused?: TabsItemTokens;
  pressed?: TabsItemTokens;
  disabled?: TabsItemTokens;
  selected?: TabsItemTokens;
}

export interface TabsItemProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * The text string for the option
   */
  headerText?: string;

  /**
   * The number for the TabsItem count
   */
  itemCount?: number;

  /**
   * A unique key-identifier for each option
   */
  itemKey: string;

  /**
   * Whether or not the tabs item is selectable
   */
  disabled?: boolean;

  /**
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  testID?: string;
}

export interface TabsItemState extends IPressableState {
  selected?: boolean;
}

export interface TabsItemInfo {
  props: IWithPressableEvents<TabsItemProps & React.ComponentPropsWithRef<any>>;
  state: TabsItemState;
}

export interface TabsItemSlotProps {
  root: React.PropsWithRef<ViewProps>;
  icon: IconProps;
  stack: ViewProps;
  indicator: ViewProps;
  content: TextProps;
}

export interface TabItemType {
  props: TabsItemProps;
  tokens: TabsItemTokens;
  slotProps: TabsItemSlotProps;
  state: TabsItemState;
}
