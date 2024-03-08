import * as React from 'react';
import type { ViewStyle, LayoutChangeEvent } from 'react-native';

import { mergeStyles } from '@fluentui-react-native/framework';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import type { LayoutSize, OverflowItemChangeHandler } from '../Overflow/Overflow.types';
import { useOverflowContext } from '../OverflowContext';

/**
 * Hook for getting the item's onLayout callback and whether the item should be showing.
 */
export function useOverflowItem(props: OverflowItemProps): OverflowItemInfo {
  const { overflowID, priority, onOverflowItemChange: onOveflowItemChange } = props;
  const { itemVisibility, initialOverflowLayoutDone, disconnect, register, setLayoutState, updateItem } = useOverflowContext();

  const [size, setSize] = React.useState<LayoutSize>();
  const [controlledSize, setControlledSize] = React.useState<LayoutSize | null>(null);

  const handleOverflowItemChange: OverflowItemChangeHandler = React.useCallback(
    (data) => {
      if (data.id === overflowID && data.type === 'layout') {
        setControlledSize(data.newLayout);
      }
      onOveflowItemChange && onOveflowItemChange(data);
    },
    [onOveflowItemChange, overflowID],
  );

  React.useEffect(() => {
    if (size) {
      updateItem({ id: overflowID, size: size, priority: priority });
    }
    // The item's size updates whenever the onLayout callback runs. This is purely for updating the item info when its priority changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priority]);

  React.useEffect(() => {
    register(overflowID, handleOverflowItemChange);
    return () => disconnect(overflowID);
    // Runs when mounting / unmounting / whenever an onOverflowItemChange callback is added. Register / disconnect shouldn't be called at any
    // other point.
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

  const styles = React.useMemo<ViewStyle>(() => {
    const stylesToMerge = [props.style];
    if (controlledSize !== null) {
      stylesToMerge.push({ width: controlledSize.width });
    }
    return mergeStyles(...stylesToMerge);
  }, [controlledSize, props.style]);

  return {
    props: { ...props, style: styles, onLayout },
    state: { visible: !initialOverflowLayoutDone || itemVisibility[overflowID] },
  };
}
