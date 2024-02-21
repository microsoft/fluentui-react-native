import * as React from 'react';

import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

import type { OverflowItemInfo, OverflowItemCoreProps } from './OverflowItem.types';
import { useOverflowContext } from '../OverflowContext';

export function useOverflowItem(props: OverflowItemCoreProps): OverflowItemInfo {
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
