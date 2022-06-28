import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import type { MenuListProps } from '../MenuList/MenuList.types';

export const menuName = 'Menu';

export interface MenuProps extends MenuListProps {
  /**
   * Whether the popup is open on mount
   */
  defaultOpen?: boolean;

  /**
   * How much delay to have between hover in and showing the menu, in ms.
   */
  hoverDelay?: number;

  /**
   * Whether the popup is open
   */
  open?: boolean;

  /**
   * Call back when the component requests to change value
   */
  onOpenChange?: (e: InteractionEvent, isOpen: boolean) => void;

  /*
   * Opens the menu on hovering over the trigger
   */
  openOnHover?: boolean;

  /**
   * Do not dismiss the menu when a menu item is clicked
   */
  persistOnItemClick?: boolean;
}

export interface MenuState extends MenuProps {
  isControlled: boolean;
  isSubmenu: boolean;
  parentPopoverHoverOutTimer?: NodeJS.Timeout;
  setOpen: (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void;
  shouldFocusOnContainer: boolean;
  triggerRef: React.RefObject<React.Component>;
}
