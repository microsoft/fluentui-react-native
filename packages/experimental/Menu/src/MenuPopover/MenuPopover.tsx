import React from 'react';
import { stagedComponent, useFluentTheme } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);
  const theme = useFluentTheme();

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    return (
      <Callout target={state.triggerRef} borderWidth={1} borderColor={theme.colors.neutralStrokeAccessible}>
        {children}
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
