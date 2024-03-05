import type { LayoutSize } from './Overflow/Overflow.types';
import type { OverflowManagerOptions, OverflowManager, OverflowItemEntry, OverflowUpdatePayload } from './overflowManager.types';
import { createPriorityQueue } from './priorityQueue';
import type { PriorityQueue } from './priorityQueue';

type ProcessOverflowItemsReturn = { type: 'visibility' } | { type: 'dimension'; shrinking: boolean };

/**
 * This function is used to construct an overflow manager.
 *
 * The OverflowManager is a helper object that keeps track of each overflow item, calculates which items are visible and invisible
 * when the container's size changes, and emits events that help track changes to visibilities and sizes of given OverflowItems. This
 * logic is put here instead of within a React hook for better modularity and becausehaving the calculations here will not cause
 * unnecessary re-renders.
 *
 * The cycle for calculating visibility goes as follows:
 *   1. Overflow onLayout - size of the container has changed / OverflowItem mounting - item has been added or removed
 *   2. processOverflowItems() - Get the total container width and the current visible item width. Show / hide items if there is space to
 *      be added or removed. Track which items have visibility changes, if any.
 *   3. If a change has occured, dispatch events to the Overflow container and the individual OverflowItem whose visibility has changed.
 *
 * The useOverflow hook of the Overflow component creates and uses an overflow manager.
 */
export function createOverflowManager(): OverflowManager {
  const items: Record<string, OverflowItemEntry> = {};

  let forceDispatch = false;
  let numItems = 0;

  // processItemsChangeMap is used to track which OverflowItems have had visibility changes during `processOverflowItems` calls.
  // Keys are ids and values are whether their visibilities have changed.
  let processItemsChangeMap: Record<string, boolean> = {};
  let menuSize: LayoutSize = { width: 0, height: 0 };
  let containerSize: LayoutSize;
  let padding: number;
  let lastItemDimensionHasChanged: boolean = false;
  let onUpdateItemDimension: OverflowManagerOptions['onUpdateItemDimension'];
  let onUpdateItemVisibility: OverflowManagerOptions['onUpdateItemVisibility'];
  let onOverflowUpdate: OverflowManagerOptions['onOverflowUpdate'];

  // Comparison function to order items in priority queue. Items with a larger priority value are sorted first. If there's a tie, then
  // the initial ordering set when adding an item to the manager is used.
  const compareItems = (lt: string | null, rt: string | null): number => {
    if (!lt || !rt) {
      return 0;
    }
    if (items[lt].priority > items[rt].priority) {
      return items[lt].priority > items[rt].priority ? 1 : -1;
    }
    return items[lt].initialOrder < items[rt].initialOrder ? 1 : -1;
  };

  // Priority queue of item ids that are to be shown or hidden.
  const visibleItems: PriorityQueue<string> = createPriorityQueue(compareItems);
  const invisibleItems: PriorityQueue<string> = createPriorityQueue(compareItems);

  // Method for getting the occupied size = sum(visible items) + current menu size
  // TODO: add support for vertical overflow using height.
  const occupiedSize = () => {
    let totalSize = 0;
    for (const id of visibleItems.all()) {
      totalSize += items[id].size.width;
    }
    if (invisibleItems.size() > 0) {
      totalSize += menuSize.width;
    }
    return totalSize;
  };

  // Flag for whether the last visible item should be shrunk and whether we should emit OverflowItemVisibilityChange events.
  const shouldShrinkMinVisible = () => {
    return visibleItems.size() === 1 && occupiedSize() > containerSize.width - padding;
  };

  // Method for emitting overflow update events.
  const dispatchUpdates = (updates: ProcessOverflowItemsReturn[]) => {
    for (const update of updates) {
      if (update.type === 'dimension' && onUpdateItemDimension) {
        let newSize = containerSize.width - padding;
        if (invisibleItems.size() > 0) {
          newSize -= 2 * menuSize.width;
        }
        const id = visibleItems.peek();
        const payload = { id: id, update: update.shrinking ? { width: newSize, height: items[id].size.height } : null };
        onUpdateItemDimension(payload);
      } else {
        const payload: OverflowUpdatePayload = {
          visibleIds: [...visibleItems.all()],
          invisibleIds: [...invisibleItems.all()],
        };
        onOverflowUpdate && onOverflowUpdate(payload);
        // dispatch visibility updates to individual items
        for (const item in processItemsChangeMap) {
          if (processItemsChangeMap[item]) {
            onUpdateItemVisibility && onUpdateItemVisibility({ id: item, visible: visibleItems.contains(item) });
          }
        }
      }
    }
  };

  const showItem = () => {
    const itemToShow = invisibleItems.dequeue();
    visibleItems.enqueue(itemToShow);
    processItemsChangeMap[itemToShow] = !processItemsChangeMap[itemToShow];
  };

  const hideItem = () => {
    const itemToHide = visibleItems.dequeue();
    invisibleItems.enqueue(itemToHide);
    processItemsChangeMap[itemToHide] = !processItemsChangeMap[itemToHide];
  };

  /** Method called whenever `update()` is called. On container size changing / items being added or deleted, we re-do our math
   * to see if any items can be shown or hidden. If one item remains, and the size of the item exceeds that of the container, we
   * also calculate what the new size of the item should be to truncate it.
   *
   * If any item visibilities should be updated or if the last items dimensions should change, we return objects that state said updates.*/
  const processOverflowItems = (): ProcessOverflowItemsReturn[] => {
    if (!containerSize) {
      return [];
    }
    processItemsChangeMap = {}; // clear the map

    const ret: ProcessOverflowItemsReturn[] = [];
    const availableSize = containerSize.width - padding;

    const visibleTop = visibleItems.peek();
    const invisibleTop = invisibleItems.peek();

    for (let i = 0; i < 2; i++) {
      while ((occupiedSize() < availableSize && invisibleItems.size() > 0) || invisibleItems.size() === 1) {
        showItem();
      }
      while (occupiedSize() > availableSize && visibleItems.size() > 1) {
        hideItem();
      }
    }

    const itemVisibilityHasChanged = visibleTop !== visibleItems.peek() || invisibleTop !== invisibleItems.peek();
    const lastVisibleSizeShouldShrink = shouldShrinkMinVisible();

    if (itemVisibilityHasChanged) {
      ret.push({ type: 'visibility' });
    }
    if (lastVisibleSizeShouldShrink || lastItemDimensionHasChanged) {
      ret.push({
        type: 'dimension',
        shrinking: lastVisibleSizeShouldShrink,
      });
    }
    lastItemDimensionHasChanged = lastVisibleSizeShouldShrink;
    return ret;
  };

  // Public method to create and parameterize the manager
  const initialize = (options: OverflowManagerOptions) => {
    containerSize = options.initialContainerSize;
    padding = options.padding ?? 0;
    onUpdateItemVisibility = options.onUpdateItemVisibility;
    onOverflowUpdate = options.onOverflowUpdate;
    onUpdateItemDimension = options.onUpdateItemDimension;
  };

  // Public method to update properties of a given item
  const updateItem = (id: string, updates: Partial<OverflowItemEntry>) => {
    // implement
    if (!updates.size || !shouldShrinkMinVisible()) {
      items[id] = { ...items[id], ...updates };
    }
    update();
  };

  // Public method to set / reset the overflow's menu size
  const setMenuSize = (size: LayoutSize) => {
    // implement
    menuSize = size;
    update();
  };

  // Public method to register an overflow item
  const addItem = (entry: OverflowItemEntry) => {
    updateItem(entry.id, { ...entry, initialOrder: numItems++ });
    visibleItems.enqueue(entry.id);
    forceDispatch = true;

    update();
  };

  // Public method that returns whether an item with the given id exists in the manager
  const hasItem = (id: string) => !!items[id];

  // Public method to delete and cleanup an item from the manager
  const removeItem = (id: string) => {
    // implement
    delete items[id];
    if (visibleItems.contains(id)) {
      visibleItems.remove(id);
    } else if (invisibleItems.contains(id)) {
      invisibleItems.remove(id);
    }
    forceDispatch = true;
    update();
  };

  // Public method to run whenever the Overflow container receives a layout event
  const update = (newContainerSize?: LayoutSize) => {
    if (newContainerSize) {
      containerSize = newContainerSize;
    }
    const processOverflowItemsRet = processOverflowItems();
    if (processOverflowItemsRet.length > 0) {
      forceDispatch = false;
      dispatchUpdates(processOverflowItemsRet);
    } else if (forceDispatch) {
      forceDispatch = false;
      dispatchUpdates([{ type: 'visibility' }]);
    }
  };

  return {
    addItem,
    hasItem,
    initialize,
    removeItem,
    updateItem,
    setMenuSize,
    update,
  };
}
