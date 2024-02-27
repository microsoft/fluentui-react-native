import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import type { LayoutSize } from '../Overflow/Overflow.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowItem<T = ButtonProps>(props: OverflowItemProps<T>): OverflowItemInfo<T> {
  const { overflowID, priority } = props;
  const { itemVisibility, initialOverflowLayoutDone, setLayoutState, updateItem } = useOverflowContext();

  const [size, setSize] = React.useState<LayoutSize>();

  // console.log(layoutHandler);

  React.useEffect(() => {
    if (size) {
      updateItem({ id: overflowID, size: size, priority: priority });
    }
  }, [priority]);

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
