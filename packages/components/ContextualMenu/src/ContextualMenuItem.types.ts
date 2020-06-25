import * as React from 'react';
import { ViewProps, ImageProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { ITextTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableState } from '@fluentui-react-native/interactive-hooks';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const contextualMenuItemName = 'ContextualMenuItem';

export interface IContextualMenuItemState extends IPressableState {
  /**
   * Whether the menu item is clicked
   */
  // clicked?: boolean;

  /**
   * Whether the menu item is disabled or not
   */
  disabled?: boolean;

  content?: boolean;
  icon?: boolean;
}

export interface IContextualMenuItemTokens extends ITextTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens { }

export interface IContextualMenuItemProps extends Omit<IPressableProps, 'onPress'> {
  /*
   ** A unique key-identifier for each menu item
   */
  key: string;
  /*
   * Text to show on the ContextualMenuItem.
   */
  text?: string;

  /*
   * Source URL or name of the icon to show on the ContextualMenuItem.
   */
  icon?: string;
  /**
   * A RefObject to access the IContextualMenuItem interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;
  /**
   * A callback to call on ContextualMenuItem click event
   */
  onClick?: () => void;

  testID?: string;
  /**
   * Title (tooltip) text displayed when hovering over an item.
   */
  title?: string;
  // dismissMenu?: (e? : any, dismissAll?: boolean) => void;
}

export interface IContextualMenuItemSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  stack: ViewProps;
  icon: ImageProps;
  content: ITextProps;
}

export type IContextualMenuItemRenderData = IRenderData<IContextualMenuItemSlotProps, IContextualMenuItemState>;

export interface IContextualMenuItemType {
  props: IContextualMenuItemProps;
  tokens: IContextualMenuItemTokens;
  slotProps: IContextualMenuItemSlotProps;
  state: IContextualMenuItemState;
}
