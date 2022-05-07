import React from 'react';
import { stagedComponent, useFluentTheme } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';
import { useMenuContext } from '../context/menuContext';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);
  const theme = useFluentTheme();
  const context = useMenuContext();

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    return (
      <Callout
        target={state.triggerRef}
        borderWidth={1}
        onDismiss={() => context.setOpen(undefined, false /* isOpen */)}
        borderColor={theme.colors.neutralStrokeAccessible}
      >
        {children}
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
