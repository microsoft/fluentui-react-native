import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

import type { OverflowMenuProps, OverflowMenuInfo } from './Overflow.types';
import { useOverflowContext } from './OverflowContext';

export function useOverflowMenu(props: OverflowMenuProps): OverflowMenuInfo {
  const { itemVisibility, initialOverflowLayoutDone, hasOverflow, setLayoutState, updateMenuSize } = useOverflowContext();
  const { buttonProps } = props;

  const onButtonLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      updateMenuSize({ width, height });
      buttonProps?.onLayout && buttonProps?.onLayout(e);

      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'menu', layoutDone: true });
      }
    },
    [updateMenuSize, buttonProps, initialOverflowLayoutDone, setLayoutState],
  );

  const menuItems = Object.keys(itemVisibility).filter((id) => !itemVisibility[id]);

  return {
    state: {
      showMenu: !initialOverflowLayoutDone || hasOverflow,
      menuItems: menuItems,
    },
    props: {
      ...props,
      buttonProps: {
        children: `+${menuItems.length} items`,
        ...buttonProps,
        onLayout: onButtonLayout,
      },
    },
  };
}
