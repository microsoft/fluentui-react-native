import * as React from 'react';
import { PressableProps, ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { ITextProps } from '@fluentui-react-native/text';
import { IconProps } from '@fluentui-react-native/icon';
import { IButtonProps, IButtonTokens } from '@fluentui-react-native/button';

export const tabsItemName = 'TabsItem';

export interface TabsItemInfo extends IPressableState {
  /**
   * Disables the button.
   * @default false
   */
  disabled?: boolean;

  /**
   * Button icon.
   */
  icon?: boolean;

  /**
   * Button text.
   */
  headerText: boolean;

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

// Props for the radio button
export interface TabsItemProps extends IButtonProps {
  /*
   ** The text string for the option
   */
  headerText: string;

  /*
   ** A unique key-identifier for each option
   */
  buttonKey: string;

  /*
   ** Whether or not the radio button is selectable
   */
  disabled?: boolean;

  /*
   ** An optional string for the Narrator to read for each RadioButton. If not provided, this will be set to the button's content
   */
  ariaLabel?: string;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
}

export interface TabsItemTokens extends IButtonTokens {
  textBorderColor?: string;
}

export interface TabsItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
  ripple?: PressableProps; // This slot exists to enable ripple-effect in android. It does not affect other platforms.
  stack: ViewProps;
  icon: IconProps;
  content: ITextProps;
}

export type TabsItemRenderData = IRenderData<TabsItemSlotProps, TabsItemState>;

export interface TabsItemType {
  props: TabsItemProps;
  tokens: TabsItemTokens;
  slotProps: TabsItemSlotProps;
  state: TabsItemState;
}
