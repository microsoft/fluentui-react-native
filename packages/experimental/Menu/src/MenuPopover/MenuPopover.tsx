import React from 'react';
import { stagedComponent, useFluentTheme } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';
import { Platform } from 'react-native';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);
  const theme = useFluentTheme();

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    // Initial focus behavior differs per platform, Windows platforms move focus
    // automatically onto first element of Callout
    const setInitialFocus = Platform.OS === ('win32' as any) || Platform.OS === 'windows';
    return (
      <Callout
        borderWidth={1}
        borderColor={theme.colors.neutralStrokeAccessible}
        target={state.triggerRef}
        onDismiss={state.onDismiss}
        dismissBehaviors={state.dismissBehaviors}
        setInitialFocus={setInitialFocus}
      >
        {children}
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
