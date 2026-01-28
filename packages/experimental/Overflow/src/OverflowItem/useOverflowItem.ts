import * as React from 'react';
import type { ViewStyle, LayoutChangeEvent } from 'react-native';

import { mergeStyles } from '@fluentui-react-native/framework';

import type { OverflowItemInfo, OverflowItemProps } from './OverflowItem.types';
import type { LayoutSize, OverflowItemChangePayload } from '../Overflow/Overflow.types';
import { useOverflowContext } from '../OverflowContext';

/**
 * Hook for getting the item's onLayout callback and whether the item should be showing.
 */
export function useOverflowItem(props: OverflowItemProps): OverflowItemInfo {
  const { overflowID, priority, onOverflowItemChange: onOveflowItemChange } = props;
  const {
    containerSize,
    dontHideBeforeReady,
    itemVisibility,
    initialOverflowLayoutDone,
    disconnect,
    register,
    setLayoutState,
    updateItem,
  } = useOverflowContext();

  const [size, setSize] = React.useState<LayoutSize>();
  const [controlledSize, setControlledSize] = React.useState<LayoutSize | null>(null);

  const handleOverflowItemChange = React.useCallback(
    (data: OverflowItemChangePayload) => {
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
  }, [priority]);

  React.useEffect(() => {
    register(overflowID, handleOverflowItemChange);
    return () => disconnect(overflowID);
    // Runs when mounting / unmounting / whenever an onOverflowItemChange callback is added. Register / disconnect shouldn't be called at any
    // other point.
  }, [onOveflowItemChange]);

  React.useLayoutEffect(() => {
    // When rendered in a ScrollView on win32, the layout event initially returns a width = 0 before getting the correct layout values.
    // By waiting until the container size is more accurate, we reduce unnecessary updates in the OverflowManager and reduce visual quirks / OverflowItem pop-in.
    if (containerSize && containerSize.width > 0 && size) {
      updateItem({ id: overflowID, size: size, priority: priority });

      if (!initialOverflowLayoutDone) {
        setLayoutState({ type: 'item', id: overflowID, layoutDone: true });
      }
    }
    // This effect should only run when the size of the item or container changes.
  }, [size, containerSize]);

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const itemSize = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
      setSize(itemSize);
      props.onLayout && props.onLayout(e);
    },
    [props],
  ); // Get item dimensions

  const layoutDone = initialOverflowLayoutDone && !!size;

  const styles = React.useMemo<ViewStyle>(() => {
    const stylesToMerge = [];
    if (props.style) {
      stylesToMerge.push(props.style);
    }
    if (controlledSize !== null) {
      stylesToMerge.push({ width: controlledSize.width });
    }
    if (!dontHideBeforeReady && !layoutDone) {
      stylesToMerge.push({ opacity: 0 });
    }
    return mergeStyles<ViewStyle>(...stylesToMerge);
  }, [controlledSize, dontHideBeforeReady, layoutDone, props.style]);

  // Visibility being set extends past the general itemVisibility controlled by the Overflow state.
  // If this is the first render of the Overflow item (initial page load / mounting after page load), we need to render to run layout and get size info.
  return {
    props: { ...props, style: styles, onLayout },
    state: { visible: itemVisibility[overflowID], layoutDone: layoutDone },
  };
}
