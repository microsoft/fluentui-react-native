import * as React from 'react';
import { ViewProps} from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, IWithPressableOptions, IWithPressableEvents } from '@fluentui-react-native/interactive-hooks';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import { IconProps } from '@fluentui-react-native/icon';
import { TabsItemTokens, TabsItemState } from './TabsItem.types';

type IconSourcesType = number | string | IconProps;

export interface TabsItemProps extends Omit<IWithPressableOptions<IViewWin32Props>, 'onPress'>   {
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

export interface TabsItemInfo {
  props: IWithPressableEvents<TabsItemProps & React.ComponentPropsWithRef<any>>;
  state: TabsItemState;
}

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
