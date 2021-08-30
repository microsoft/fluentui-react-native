import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { ITextProps } from '@fluentui-react-native/text';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { FontTokens, IBackgroundColorTokens, IBorderTokens, IForegroundColorTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';

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

export interface TabsItemProps extends IPressableProps {
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

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Source URL or name of the icon to show on the TabsItem.
   */
  icon?: IconSourcesType;

  testID?: string;
}

export interface TabsItemTokens extends IForegroundColorTokens, FontTokens, IBackgroundColorTokens, IBorderTokens {
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
