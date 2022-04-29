import React from 'react';
import { stagedComponent } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    return (
      <Callout maxWidth={300} target={state.triggerRef}>
        {children}
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
