import type { LayoutSize } from './Overflow/Overflow.types';
import type { OverflowManagerOptions, OverflowManager, OverflowItemEntry } from './overflowManager.types';
import { createPriorityQueue } from './priorityQueue';
import type { PriorityQueue } from './priorityQueue';

export function createOverflowManager(): OverflowManager {
  const items: Record<string, OverflowItemEntry> = {};

  let forceDispatch = false;
  let debug = false;
  let numItems = 0;

  let menuSize: LayoutSize = { width: 0, height: 0 };
  let containerSize: LayoutSize;
  let padding: number;
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

    const lte = items[lt];
    const rte = items[rt];

    if (lte.priority !== rte.priority) {
      return lte.priority - rte.priority;
    }

    return rte.initialOrder - lte.initialOrder ? 1 : -1;
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

  const dispatchUpdate = () => {
    log('occupied', occupiedSize(), '| available', containerSize.width - padding);
    log(visibleItems.all().map((id) => `(${id}, ${items[id].priority}, ${items[id].initialOrder})`));
    log(invisibleItems.all().map((id) => `(${id}, ${items[id].priority}, ${items[id].initialOrder})`));
    onOverflowUpdate &&
      onOverflowUpdate({
        visibleIds: visibleItems.all(),
        invisibleIds: invisibleItems.all(),
      });
  };

  const showItem = () => {
    const itemToShow = invisibleItems.dequeue();
    log('showing', itemToShow);
    visibleItems.enqueue(itemToShow);
    onUpdateItemVisibility && onUpdateItemVisibility({ id: itemToShow, visible: true });
  };

  const hideItem = () => {
    const itemToHide = visibleItems.dequeue();
    log('hiding', itemToHide);
    invisibleItems.enqueue(itemToHide);
    onUpdateItemVisibility && onUpdateItemVisibility({ id: itemToHide, visible: false });
  };

  const processOverflowItems = () => {
    if (!containerSize) {
      return false;
    }
    const availableSize = containerSize.width - padding;

    const visibleTop = visibleItems.peek();
    const invisibleTop = invisibleItems.peek();

    log('processing, occupied', occupiedSize(), 'available', availableSize);

    for (let i = 0; i < 2; i++) {
      log('try showing', i + 1);
      while ((occupiedSize() < availableSize && invisibleItems.size() > 0) || invisibleItems.size() === 1) {
        showItem();
      }
      log('try hiding', i + 1);
      while (occupiedSize() > availableSize && visibleItems.size() > 0) {
        hideItem();
      }
    }

    log(`${visibleTop} !== ${visibleItems.peek()} || ${invisibleTop} !== ${invisibleItems.peek()}`);

    return visibleTop !== visibleItems.peek() || invisibleTop !== invisibleItems.peek();
  };

  const initialize = (options: OverflowManagerOptions) => {
    debug = options.debug;
    log('container size:', options.initialContainerSize);
    containerSize = options.initialContainerSize;
    padding = options.padding ?? 0;
    onUpdateItemVisibility = options.onUpdateItemVisibility;
    onOverflowUpdate = options.onOverflowUpdate;
  };

  const updateItem = (id: string, updates: Partial<OverflowItemEntry>) => {
    // implement
    items[id] = { ...items[id], ...updates };
    update();
  };

  const setMenuSize = (size: LayoutSize) => {
    // implement
    menuSize = size;
    log(menuSize);
    update();
  };

  const addItem = (entry: OverflowItemEntry) => {
    log('new item:', entry);
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
      log('new container size:', newContainerSize);
      containerSize = newContainerSize;
    }
    if (processOverflowItems() || forceDispatch) {
      forceDispatch = false;
      dispatchUpdate();
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
