import React from 'react';
import { compressible, mergeProps, patchTokens, useFluentTheme, UseTokens } from '@fluentui-react-native/framework';
import { Callout } from '@fluentui-react-native/callout';
import { menuPopoverName, MenuPopoverProps, MenuPopoverTokens } from './MenuPopover.types';
import { useMenuPopover } from './useMenuPopover';
import { useMenuPopoverTokens } from './MenuPopoverTokens';
import { View } from 'react-native';

export const MenuPopover = compressible<MenuPopoverProps, MenuPopoverTokens>(
  (props: MenuPopoverProps, useTokens: UseTokens<MenuPopoverTokens>) => {
    const { directionalHint, gapSpace, maxHeight, maxWidth, minPadding, borderWidth, borderColor, backgroundColor } = props;
    const state = useMenuPopover(props);
    const theme = useFluentTheme();
    let [tokens, cache] = useTokens(theme);

    [tokens, cache] = patchTokens(tokens, cache, {
      directionalHint,
      gapSpace,
      maxHeight,
      maxWidth,
      minPadding,
      borderWidth,
      borderColor,
      backgroundColor,
    });

    return (final: MenuPopoverProps, children: React.ReactNode) => {
      const mergedProps = mergeProps(tokens, state.props, final);
      const content = React.createElement(View, state.innerView, children);
      return <Callout {...mergedProps}>{content}</Callout>;
    };
  },
  useMenuPopoverTokens,
);
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
