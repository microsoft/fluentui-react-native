import * as React from 'react';

import type { ButtonProps } from '@fluentui-react-native/button';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowItem<T = ButtonProps>(props: OverflowItemProps<T>): OverflowItemInfo<T> {
  const { overflowID, onLayout: layoutHandler } = props;
  const { itemVisibility, initialOverflowLayoutDone, setLayoutState, updateItemSize } = useOverflowContext();

  // console.log(layoutHandler);

  const onLayout = React.useCallback(
    (e: LayoutEvent) => {
      console.log(overflowID, 'overflow item');
      const { width, height } = e.nativeEvent.layout;
      updateItemSize(overflowID, { width, height });
      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'item', id: overflowID, layoutDone: true });
      }

      layoutHandler && layoutHandler(e);
    },
    [overflowID],
  ); // Get item dimensions

  return {
    props: { ...props, onLayout },
    state: { visible: !initialOverflowLayoutDone || itemVisibility[overflowID] },
  };
}
