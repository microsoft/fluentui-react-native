import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import type { MenuListProps } from '../MenuList/MenuList.types';

export const menuName = 'Menu';

export interface MenuProps extends MenuListProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (e: InteractionEvent, isOpen: boolean) => void;
  openOnHover?: boolean;
}

export interface MenuState extends MenuProps {
  isControlled: boolean;
  isSubmenu: boolean;
  parentPopoverHoverOutTimer?: NodeJS.Timeout;
  setOpen: (e: InteractionEvent, isOpen: boolean) => void;
  triggerRef: React.RefObject<React.Component>;
}
