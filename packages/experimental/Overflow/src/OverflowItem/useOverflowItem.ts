import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import type { LayoutSize } from '../Overflow/Overflow.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowItem(props: OverflowItemProps): OverflowItemInfo {
  const { overflowID, priority, onOverflowItemChange: onOveflowItemChange } = props;
  const { itemVisibility, initialOverflowLayoutDone, disconnect, register, setLayoutState, updateItem } = useOverflowContext();

  const [size, setSize] = React.useState<LayoutSize>();

  React.useEffect(() => {
    if (size) {
      updateItem({ id: overflowID, size: size, priority: priority });
    }
  }, [priority]);

  React.useEffect(() => {
    if (onOveflowItemChange) {
      register(overflowID, onOveflowItemChange);
    }
    return () => disconnect(overflowID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOveflowItemChange]);

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const itemSize = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
      setSize(itemSize);
      updateItem({ id: overflowID, size: itemSize, priority: priority });

      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'item', id: overflowID, layoutDone: true });
      }

      props.onLayout && props.onLayout(e);
    },
    [initialOverflowLayoutDone, overflowID, priority, props, setLayoutState, updateItem],
  ); // Get item dimensions

  return {
    props: { ...props, onLayout },
    state: { visible: !initialOverflowLayoutDone || itemVisibility[overflowID] },
  };
}
