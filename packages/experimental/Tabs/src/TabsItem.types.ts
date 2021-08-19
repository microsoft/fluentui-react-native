import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IShadowTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import { IconProps } from '@fluentui-react-native/icon';

export const tabsItemName = 'TabsItem';
type IconSourcesType = number | string | IconProps;

export interface TabsItemTokens extends FontTokens, IBorderTokens, IShadowTokens {
  /**
   * The indicator color.
   */
   indicatorColor?: string;

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
   primary?: TabsItemTokens;
   ghost?: TabsItemTokens;
   fluid?: TabsItemTokens;
   fab?: TabsItemTokens;
}

export interface TabsItemProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   ** The text string for the option
   */
   headerText?: string;

   /*
    ** The number for the TabsItem count
    */
   itemCount?: number;

   /*
    ** A unique key-identifier for each option
    */
   itemKey: string;

   /*
    ** Whether or not the tabs item is selectable
    */
   disabled?: boolean;

   /*
    ** Defines the current tabs item's position in tabs for accessibility purposes. It's recommended to set this value if
    ** tabs item are not direct children of tabs. This value is auto-generated if tabs item are direct children of tabs.
    */
   accessibilityPosInSet?: number;

   /*
    ** Defines the number of tabs items in the group for accessibility purposes. It's recommended to set this value if tabs
    ** items are not direct children of tabs. This value is auto-generated if tabs items are direct children of tabs.
    */
   accessibilitySetSize?: number;

   /*
    ** An accessibility label for narrator.
    */
   accessibilityLabel?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  testID?: string;

  /** A button can emphasize that it represents the primary action. */
  primary?: boolean;

  /** A button can blend into its background to become less emphasized. */
  ghost?: boolean;

  /** A button can fill the width of its container. */
  fluid?: boolean;

  /** A floating action button  */
  fab?: boolean;
}

export type TabsItemState = IPressableHooks<TabsItemProps & React.ComponentPropsWithRef<any>>;

export interface TabsItemSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  icon: IconProps;
  stack: ViewProps;
  indicator: ViewProps;
  content: TextProps;
}

export interface TabItemType {
  props: TabsItemProps;
  tokens: TabsItemTokens;
  slotProps: TabsItemSlotProps;
}
