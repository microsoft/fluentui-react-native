import React from 'react';
import { stagedComponent } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuContext } from '../context/menuContext';

export const MenuPopover = stagedComponent((_props: MenuPopoverProps) => {
  const context = useMenuContext();

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    return context.open && <Callout>{children}</Callout>;
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
