import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

import type { OverflowMenuState } from './OverflowMenu.types';
import { useOverflowContext } from '../OverflowContext';

/**
 * Hook to get state for an overflow menu dropdown.
 *
 * A menu must be created as a child in the Overflow component, and this hook must be called. Otherwise, the Overflow will not render correctly.
 */
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

  // Visibility of a menu item is the inverse of whether an item is visible within the overflow
  const menuItemVisibilities = React.useMemo(() => {
    const ret = {};
    for (const key in itemVisibility) {
      ret[key] = !itemVisibility[key];
    }
    return ret;
  }, [itemVisibility]);

  return {
    showMenu: !initialOverflowLayoutDone || hasOverflow,
    menuItemVisibilities: menuItemVisibilities,
    menuRef: overflowMenuRef,
    onLayout: onButtonLayout,
  };
}
