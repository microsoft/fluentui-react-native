import * as React from 'react';

import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { OverflowItemProps, OverflowItemInfo } from './Overflow.types';
import { useOverflowContext } from './OverflowContext';

export function useOverflowItem(props: OverflowItemProps): OverflowItemInfo {
  const { id } = props;
  const { itemVisibility, initialOverflowLayoutDone, setLayoutState, updateItemSize } = useOverflowContext();

  const onLayout = React.useCallback(
    (e: LayoutEvent) => {
      const { width, height } = e.nativeEvent.layout;
      updateItemSize(id, { width, height });
      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'item', id: id, layoutDone: true });
      }
    },
    [id],
  ); // Get item dimensions

  return {
    props: { ...props, onLayout },
    state: { visible: !initialOverflowLayoutDone || itemVisibility[id] },
  };
}
