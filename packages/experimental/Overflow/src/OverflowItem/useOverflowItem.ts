import * as React from 'react';

import type { ButtonProps } from '@fluentui-react-native/button';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowItem<T = ButtonProps>(props: OverflowItemProps<T>): OverflowItemInfo<T> {
  const { overflowID } = props;
  const { itemVisibility, initialOverflowLayoutDone, setLayoutState, updateItemSize } = useOverflowContext();

  const onLayout = React.useCallback(
    (e: LayoutEvent) => {
      const { width, height } = e.nativeEvent.layout;
      updateItemSize(overflowID, { width, height });
      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'item', id: overflowID, layoutDone: true });
      }
    },
    [overflowID],
  ); // Get item dimensions

  return {
    props: { ...props, onLayout },
    state: { visible: !initialOverflowLayoutDone || itemVisibility[overflowID] },
  };
}
