import * as React from 'react';
import type { View, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

import type {
  LayoutSize,
  OverflowInfo,
  OverflowState,
  OverflowProps,
  SetLayoutStateParam,
  OverflowItemChangeHandler,
} from './Overflow.types';
import { createOverflowManager } from '../overflowManager';
import type {
  ItemVisibilityUpdatePayload,
  ItemDimensionUpdatePayload,
  OverflowItemEntry,
  OverflowManager,
  OverflowUpdatePayload,
} from '../overflowManager.types';

type PartialOverflowState = Pick<OverflowState, 'hasOverflow' | 'itemVisibility'>;

interface LayoutState {
  container: boolean;
  menu: boolean;
  items: Record<string, boolean>;
}

/**
 * Hook for Overflow component. Used as middle man between Overflow / Overflow item components and overflow manager. Can be integrated with
 * other components.
 *
 * Returns state to feed into context provider and props (with an important onLayout callback) to pass to Overflow's containing view. */
export function useOverflow(props: OverflowProps): OverflowInfo {
  const { dontHideBeforeReady, itemIDs, onLayout, onOverflowUpdate: overflowUpdateCallback, onReady, padding, style } = props;

  // The overflow manager records layout info of the container, menu, and items and calculates what is visible and what isn't.
  const overflowManager = React.useRef<OverflowManager>(createOverflowManager()).current;
  const overflowItemUpdateCallbacks = React.useRef<Record<string, OverflowItemChangeHandler>>({}).current;
  const overflowMenuRef = React.useRef<View>(null);

  const [initialLayoutDone, setInitialLayoutDone] = React.useState(false);
  const [containerSize, setContainerSize] = React.useState<LayoutSize | undefined>(undefined);
  const [overflowState, setOverflowState] = React.useState<PartialOverflowState>({
    hasOverflow: false,
    itemVisibility: {},
  });
  // This is used to check if the container, menu, and each overflow item has received a layout event and recorded it in the
  // overflow manager.
  const [layoutState, setLayoutState] = React.useState<LayoutState>(() => {
    const itemLayoutState = {};
    for (const id of itemIDs) {
      itemLayoutState[id] = false;
    }
    return {
      container: false,
      menu: false,
      items: itemLayoutState,
    };
  });

  const register = React.useCallback(
    (id: string, onItemChange: OverflowItemChangeHandler) => {
      overflowItemUpdateCallbacks[id] = onItemChange;
    },
    [overflowItemUpdateCallbacks],
  );
  const disconnect = React.useCallback(
    (id: string) => {
      delete overflowItemUpdateCallbacks[id];
      overflowManager.removeItem(id);
    },
    // overflowManager is not needed as a dependency, due to being attached to a ref

    [overflowItemUpdateCallbacks],
  );

  const userSetLayoutState = React.useCallback((data: SetLayoutStateParam) => {
    if (data.type === 'menu') {
      setLayoutState((prev) => ({ ...prev, menu: data.layoutDone }));
    } else {
      setLayoutState((prev) => ({ ...prev, items: { ...prev.items, [data.id]: data.layoutDone } }));
    }
  }, []);

  const onContainerLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      if (width !== undefined && height !== undefined) {
        setContainerSize({ width, height });
      }
      onLayout && onLayout(e);
    },
    [onLayout],
  );

  const handleItemUpdate = React.useCallback(
    (item: OverflowItemEntry) => {
      if (overflowManager.hasItem(item.id)) {
        overflowManager.updateItem(item.id, item);
      } else {
        overflowManager.addItem(item);
      }
    },
    [overflowManager],
  );

  const onMenuLayout = React.useCallback((size: LayoutSize) => overflowManager.setMenuSize(size), [overflowManager]);

  // Callback for when the overflow manager has calculated all overall changes towards item visibilities in its update cycle.
  const onOverflowUpdate = React.useCallback(
    (data: OverflowUpdatePayload) => {
      setOverflowState((prev) => {
        const visibilities: Record<string, boolean> = {};
        for (const id of data.visibleIds) {
          visibilities[id] = true;
        }
        for (const id of data.invisibleIds) {
          visibilities[id] = false;
        }
        return { ...prev, itemVisibility: visibilities, hasOverflow: data.invisibleIds.length > 0 };
      });
      overflowUpdateCallback && overflowUpdateCallback(data);
    },
    [overflowUpdateCallback],
  );

  // If there is one item showing, callback to send the dimensions the item should have to truncate itself and have everything fit neatly
  // in the overflow container.
  const onUpdateItemDimension = React.useCallback(
    (data: ItemDimensionUpdatePayload) => {
      overflowItemUpdateCallbacks[data.id] && overflowItemUpdateCallbacks[data.id]({ type: 'layout', id: data.id, newLayout: data.update });
    },
    [overflowItemUpdateCallbacks],
  );

  // Callback for when a single item has its visibility changed.
  const onUpdateItemVisibility = React.useCallback(
    (data: ItemVisibilityUpdatePayload) => {
      overflowItemUpdateCallbacks[data.id] && overflowItemUpdateCallbacks[data.id]({ type: 'visibility', ...data });
    },
    [overflowItemUpdateCallbacks],
  );

  // This layout effect is run before re-rendering, allowing us to calculate what's visible / invisible with our overflow manager.
  React.useLayoutEffect(() => {
    if (!containerSize) {
      return;
    }

    if (!layoutState.container) {
      overflowManager.initialize({
        initialContainerSize: containerSize,
        padding: typeof padding === 'number' ? padding : typeof padding === 'string' ? parseInt(padding) : 0,
        onOverflowUpdate,
        onUpdateItemDimension,
        onUpdateItemVisibility,
      });
      overflowManager.update();
      setLayoutState((prev) => ({ ...prev, container: true }));
    } else {
      overflowManager.update(containerSize);
    }
    // We only want to run this layout effect whenever the container's size updates.
  }, [containerSize]);

  // On initial mount, wait for layout to run for all items / components before showing.
  // For future items that may be added / removed, this will remain true to reduce flicker.
  React.useEffect(() => {
    const isInitialLayoutDone =
      layoutState.container && layoutState.menu && itemIDs.map((id) => layoutState.items[id]).reduce((prev, curr) => prev && curr);
    if (!initialLayoutDone && isInitialLayoutDone) {
      setInitialLayoutDone(true);
    }
  }, [layoutState, initialLayoutDone, itemIDs]);

  React.useEffect(() => {
    if (initialLayoutDone) {
      onReady && onReady();
    }
  }, [initialLayoutDone, onReady]);

  const overflowStyles = React.useMemo<StyleProp<ViewStyle>>(
    () => [
      style,
      {
        display: 'flex',
        flexDirection: 'row',
        opacity: dontHideBeforeReady || initialLayoutDone ? 1 : 0,
        padding: padding,
      },
    ],
    [dontHideBeforeReady, initialLayoutDone, padding, style],
  );

  return {
    state: {
      ...overflowState,
      containerSize,
      dontHideBeforeReady: dontHideBeforeReady,
      initialOverflowLayoutDone: initialLayoutDone,
      overflowMenuRef: overflowMenuRef,
      register: register,
      disconnect: disconnect,
      setLayoutState: userSetLayoutState,
      updateOverflow: overflowManager.update,
      updateItem: handleItemUpdate,
      updateMenuSize: onMenuLayout,
    },
    props: {
      ...props,
      style: overflowStyles,
      onLayout: onContainerLayout,
    },
  };
}
