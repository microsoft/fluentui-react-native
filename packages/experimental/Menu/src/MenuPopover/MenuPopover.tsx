import React from 'react';
import { stagedComponent, useFluentTheme } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';
import { View } from 'react-native';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);
  const theme = useFluentTheme();

  return (_rest: MenuPopoverProps, children: React.ReactNode) => {
    return (
      <Callout
        accessibilityRole={state.accessibilityRole}
        borderWidth={1}
        borderColor={theme.colors.neutralStrokeAccessible}
        target={state.triggerRef}
        onDismiss={state.onDismiss}
        dismissBehaviors={state.dismissBehaviors}
        setInitialFocus={state.setInitialFocus}
        directionalHint={state.directionalHint}
        doNotTakePointerCapture={state.doNotTakePointerCapture}
      >
        <View onMouseEnter={state.onMouseEnter} onMouseLeave={state.onMouseLeave}>
          {children}
        </View>
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
