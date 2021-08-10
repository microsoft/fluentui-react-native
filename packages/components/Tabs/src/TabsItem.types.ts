import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { ITextProps } from '@fluentui-react-native/text';
import { IconProps } from '@fluentui-react-native/icon';
import { IButtonProps, IButtonTokens } from '@fluentui-react-native/button';

export const tabsItemName = 'TabsItem';

export interface TabsItemInfo extends IPressableState {
  /**
   * TabsItem icon.
   */
  icon?: boolean;

  /**
   * TabsItem text.
   */
  headerText?: boolean;

  /**
   * Indicates if TabsItem is selected.
   */
  selected: boolean;

  /**
   * Key for tabItem
   */
  key: string;
}

export interface TabsItemState {
  info: TabsItemInfo;
}

export interface TabsItemProps extends IButtonProps {
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

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
}

export interface TabsItemTokens extends IButtonTokens {
  textBorderColor?: string;
  indicatorColor?: string;
}

export interface TabsItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
  stack: ViewProps;
  icon: IconProps;
  content: ITextProps;
  indicator: ViewProps;
}

export type TabsItemRenderData = IRenderData<TabsItemSlotProps, TabsItemState>;

export interface TabsItemType {
  props: TabsItemProps;
  tokens: TabsItemTokens;
  slotProps: TabsItemSlotProps;
  state: TabsItemState;
}
