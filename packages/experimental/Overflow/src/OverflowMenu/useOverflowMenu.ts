import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

import type { OverflowMenuState } from './OverflowMenu.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowMenu(): OverflowMenuState {
  const { itemVisibility, initialOverflowLayoutDone, hasOverflow, overflowMenuRef, setLayoutState, updateMenuSize } = useOverflowContext();

  const onButtonLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      updateMenuSize({ width, height });

      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'menu', layoutDone: true });
      }
    },
    [updateMenuSize, initialOverflowLayoutDone, setLayoutState],
  );

  const menuItems = Object.keys(itemVisibility).filter((id) => !itemVisibility[id]);

  return {
    showMenu: !initialOverflowLayoutDone || hasOverflow,
    menuItems: menuItems,
    menuRef: overflowMenuRef,
    onLayout: onButtonLayout,
  };
}
