import type * as React from 'react';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconProps } from '@fluentui-react-native/icon';
import type { IFocusable, IPressableState, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
import type { ITextProps } from '@fluentui-react-native/text';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { IRenderData } from '@uifabricshared/foundation-composable';

export const contextualMenuItemName = 'ContextualMenuItem';

export interface ContextualMenuItemState extends IPressableState {
  selected?: boolean;
  /**
   * Whether the menu item is disabled or not
   */
  disabled?: boolean;

  content?: boolean;
  icon?: boolean;
}

export interface ContextualMenuItemTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: string;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: string;

  /**
   * The size of the icon.
   */
  iconSize?: number | string;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;
}

export interface ContextualMenuItemProps extends Omit<PressablePropsExtended, 'onPress'> {
  /*
   ** A unique key-identifier for each menu item
   */
  itemKey: string;
  /*
   * Text to show on the ContextualMenuItem.
   */
  text?: string;

  /**
   * Source URL or name of the icon to show on the Button.
   */
  icon?: number | string | IconProps;
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

  dismissMenu?: (e?: any, dismissAll?: boolean) => void;
}

export interface ContextualMenuItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
  stack: IViewProps;
  icon: IconProps;
  content: ITextProps;
}

export type ContextualMenuItemRenderData = IRenderData<ContextualMenuItemSlotProps, ContextualMenuItemState>;

export interface ContextualMenuItemType {
  props: ContextualMenuItemProps;
  tokens: ContextualMenuItemTokens;
  slotProps: ContextualMenuItemSlotProps;
  state: ContextualMenuItemState;
}
