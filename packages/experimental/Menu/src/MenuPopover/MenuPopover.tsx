import React from 'react';
import { mergeProps, stagedComponent, useFluentTheme } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';
import { View } from 'react-native';

export const MenuPopover = stagedComponent((props: MenuPopoverProps) => {
  const state = useMenuPopover(props);
  const theme = useFluentTheme();

  return (final: MenuPopoverProps, children: React.ReactNode) => {
    const mergedProps = mergeProps(state.props, final);
    const content = React.createElement(View, state.innerView, children);
    return (
      <Callout borderWidth={1} borderColor={theme.colors.neutralStrokeAccessible} {...mergedProps}>
        {content}
      </Callout>
    );
  };
});
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
