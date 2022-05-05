import type { IViewProps } from '@fluentui-react-native/adapters';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';

export const menuName = 'Menu';

export interface MenuProps extends Omit<IViewProps, 'onPress'> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (e: InteractionEvent, isOpen: boolean) => void;
  openOnContext?: boolean;
  openOnHover?: boolean;
}

export interface MenuState extends MenuProps {
  isSubmenu: boolean;
  setOpen: (e: InteractionEvent) => void;
  triggerRef: React.RefObject<React.Component>;
}
