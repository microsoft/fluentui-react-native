import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import type { MenuListProps } from '../MenuList/MenuList.types';

export const menuName = 'Menu';

export interface MenuProps extends MenuListProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (e: InteractionEvent, isOpen: boolean) => void;
  openOnHover?: boolean;

  /**
   * Whether to set initial focus on the contextual menu container.
   * @default false
   * @platform win32
   */
  shouldFocusOnContainer?: boolean;
}

export interface MenuState extends MenuProps {
  isControlled: boolean;
  isSubmenu: boolean;
  setOpen: (e: InteractionEvent, isOpen: boolean) => void;
  triggerRef: React.RefObject<React.Component>;
}
