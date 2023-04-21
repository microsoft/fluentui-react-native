import React from 'react';
import { Platform, View } from 'react-native';

import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, mergeProps, patchTokens, useFluentTheme } from '@fluentui-react-native/framework';

import type { MenuPopoverProps, MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';
import { useMenuPopoverTokens } from './MenuPopoverTokens';
import { useMenuPopover } from './useMenuPopover';
import { useMenuContext } from '../context';
import { MenuCallout } from '../MenuCallout';

export const MenuPopover = compressible<MenuPopoverProps, MenuPopoverTokens>(
  (props: MenuPopoverProps, useTokens: UseTokens<MenuPopoverTokens>) => {
    const { directionalHint, gapSpace, maxHeight, maxWidth, minWidth, minPadding, borderWidth, borderColor, backgroundColor } = props;
    const state = useMenuPopover(props);
    const theme = useFluentTheme();
    const context = useMenuContext();
    let [tokens, cache] = useTokens(theme);

    context.hasMaxHeight = maxHeight != undefined;
    context.minWidth = minWidth ?? context.minWidth;

    [tokens, cache] = patchTokens(tokens, cache, {
      directionalHint,
      gapSpace,
      maxHeight,
      maxWidth,
      minWidth,
      minPadding,
      borderWidth,
      borderColor,
      backgroundColor,
    });

    return (final: MenuPopoverProps, children: React.ReactNode) => {
      const mergedProps = mergeProps(tokens, state.props, final);
      const innerViewProps =
        //For windows platforms, styling needs to be set on container view instead of the callout itself for the scrollview to reflect correct width and height
        Platform.OS === 'windows' || Platform.OS === ('win32' as any)
          ? {
              ...state.innerView,
              style: {
                maxHeight: mergedProps.maxHeight,
              },
            }
          : state.innerView;
      const content = React.createElement(View, innerViewProps, children);
      return (
        <MenuCallout tokens={tokens} {...mergedProps}>
          {content}
        </MenuCallout>
      );
    };
  },
  useMenuPopoverTokens,
);
MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
