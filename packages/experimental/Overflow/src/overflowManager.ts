import type { LayoutSize } from './Overflow.types';
import type { OverflowManagerOptions, OverflowManager } from './overflowManager.types';

export function createOverflowManager(): OverflowManager {
  const itemSizes = new Map<string, LayoutSize>();

  const visibleItems: string[] = [];
  const invisibleItems: string[] = [];

  let forceDispatch = false;

  let menuSize: LayoutSize = { width: 0, height: 0 };
  let containerSize: LayoutSize;
  let padding: number;
  let onUpdateItemVisibility: OverflowManagerOptions['onUpdateItemVisibility'];
  let onOverflowUpdate: OverflowManagerOptions['onOverflowUpdate'];

  const occupiedSize = () => {
    let totalSize = 0;
    for (const id of visibleItems) {
      totalSize += itemSizes.get(id).width;
    }
    if (invisibleItems.length > 0) {
      totalSize += menuSize.width;
    }
    return totalSize;
  };

  const dispatchUpdate = () => {
    console.log('occupied', occupiedSize(), '| available', containerSize.width - padding);
    onOverflowUpdate && onOverflowUpdate({ visibleIds: visibleItems, invisibleIds: invisibleItems });
  };

  const showItem = () => {
    const itemToShow = invisibleItems.pop();
    visibleItems.push(itemToShow);
    onUpdateItemVisibility && onUpdateItemVisibility({ id: itemToShow, visible: true });
  };

  const hideItem = () => {
    const itemToHide = visibleItems.pop();
    invisibleItems.push(itemToHide);
    onUpdateItemVisibility && onUpdateItemVisibility({ id: itemToHide, visible: false });
  };

  const processOverflowItems = () => {
    if (!containerSize) {
      return false;
    }
    const availableSize = containerSize.width - padding;

    const visibleTop = visibleItems[visibleItems.length - 1];
    const invisibleTop = invisibleItems[invisibleItems.length - 1];

    for (let i = 0; i < 2; i++) {
      while ((occupiedSize() < availableSize && invisibleItems.length > 0) || invisibleItems.length === 1) {
        showItem();
      }
      while (occupiedSize() > availableSize && visibleItems.length > 0) {
        hideItem();
      }
    }

    return visibleTop !== visibleItems[visibleItems.length - 1] || invisibleTop !== invisibleItems[invisibleItems.length - 1];
  };

  const initialize = (options: OverflowManagerOptions) => {
    containerSize = options.initialContainerSize;
    padding = options.padding ?? 0;
    onUpdateItemVisibility = options.onUpdateItemVisibility;
    onOverflowUpdate = options.onOverflowUpdate;
  };

  const setItemSize = (id: string, size: LayoutSize) => {
    // implement
    itemSizes.set(id, size);
    update();
  };

  const setMenuSize = (size: LayoutSize) => {
    // implement
    menuSize = size;
    console.log(menuSize);
    update();
  };

  const addItem = (id: string, size: LayoutSize) => {
    setItemSize(id, size);
    visibleItems.push(id);

    forceDispatch = true;

    update();
  };

  const hasItem = (id: string) => itemSizes.has(id);

  const removeItem = (id: string) => {
    // implement
    itemSizes.delete(id);
    // remove from whichever queue the item is in
    const visibleIdx = visibleItems.indexOf(id);
    const invisibleIdx = invisibleItems.indexOf(id);
    if (visibleIdx != -1) {
      visibleItems.splice(visibleIdx, 1);
    } else {
      invisibleItems.splice(invisibleIdx, 1);
    }
    forceDispatch = true;
    update();
  };

  const update = (newContainerSize?: LayoutSize) => {
    if (newContainerSize) {
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
    setItemSize,
    setMenuSize,
    update,
  };
}
