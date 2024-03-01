import type { LayoutSize } from './Overflow/Overflow.types';
import type { OverflowManagerOptions, OverflowManager, OverflowItemEntry, OverflowUpdatePayload } from './overflowManager.types';
import { createPriorityQueue } from './priorityQueue';
import type { PriorityQueue } from './priorityQueue';

type ProcessOverflowItemsReturn = { type: 'visibility' } | { type: 'dimension'; shrinking: boolean };

export function createOverflowManager(): OverflowManager {
  const items: Record<string, OverflowItemEntry> = {};

  let forceDispatch = false;
  let debug = false;
  let numItems = 0;

  let processItemsChangeMap: Record<string, boolean> = {};
  let menuSize: LayoutSize = { width: 0, height: 0 };
  let containerSize: LayoutSize;
  let padding: number;
  let lastItemDimensionHasChanged: boolean = false;
  let onUpdateItemDimension: OverflowManagerOptions['onUpdateItemDimension'];
  let onUpdateItemVisibility: OverflowManagerOptions['onUpdateItemVisibility'];
  let onOverflowUpdate: OverflowManagerOptions['onOverflowUpdate'];

  const log = (...args: any[]) => {
    if (debug) {
      console.log(...args);
    }
  };

  const compareItems = (lt: string | null, rt: string | null): number => {
    if (!lt || !rt) {
      return 0;
    }
    return items[lt].priority - items[rt].priority;
  };

  const visibleItems: PriorityQueue<string> = createPriorityQueue(compareItems);
  const invisibleItems: PriorityQueue<string> = createPriorityQueue(compareItems);

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

  const shouldShrinkMinVisible = () => {
    return visibleItems.size() === 1 && occupiedSize() > containerSize.width - padding;
  };

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
    log(lastVisibleSizeShouldShrink, lastItemDimensionHasChanged);
    if (lastVisibleSizeShouldShrink || lastItemDimensionHasChanged) {
      ret.push({
        type: 'dimension',
        shrinking: lastVisibleSizeShouldShrink,
      });
    }
    lastItemDimensionHasChanged = lastVisibleSizeShouldShrink;
    return ret;
  };

  const initialize = (options: OverflowManagerOptions) => {
    debug = options.debug;
    containerSize = options.initialContainerSize;
    padding = options.padding ?? 0;
    onUpdateItemVisibility = options.onUpdateItemVisibility;
    onOverflowUpdate = options.onOverflowUpdate;
    onUpdateItemDimension = options.onUpdateItemDimension;
  };

  const updateItem = (id: string, updates: Partial<OverflowItemEntry>) => {
    // implement
    if (!updates.size || !shouldShrinkMinVisible()) {
      items[id] = { ...items[id], ...updates };
    }
    update();
  };

  const setMenuSize = (size: LayoutSize) => {
    // implement
    menuSize = size;
    log(menuSize);
    update();
  };

  const addItem = (entry: OverflowItemEntry) => {
    updateItem(entry.id, { ...entry, initialOrder: numItems++ });
    visibleItems.enqueue(entry.id);
    forceDispatch = true;

    update();
  };

  const hasItem = (id: string) => !!items[id];

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

  const update = (newContainerSize?: LayoutSize) => {
    if (newContainerSize) {
      containerSize = newContainerSize;
    }
    const processOverflowItemsRet = processOverflowItems();
    processOverflowItemsRet.length && log(processOverflowItemsRet);
    if (processOverflowItemsRet.length > 0) {
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
