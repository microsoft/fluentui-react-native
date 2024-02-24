import type { LayoutSize } from './Overflow/Overflow.types';

export interface OverflowItemEntry {
  id: string;
  size: LayoutSize;
}

export interface ItemVisibilityUpdatePayload {
  id: string;
  visible: boolean;
}

export interface OverflowUpdatePayload {
  visibleIds: string[];
  invisibleIds: string[];
}

export interface OverflowManagerOptions {
  debug?: boolean;
  initialContainerSize: LayoutSize;
  padding?: number;
  onUpdateItemVisibility?: (data: ItemVisibilityUpdatePayload) => void;
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

export interface OverflowManager {
  addItem: (id: string, size: LayoutSize) => void;
  hasItem: (id: string) => boolean;
  initialize: (options: OverflowManagerOptions) => void;
  removeItem: (id: string) => void;
  setItemSize: (id: string, size: LayoutSize) => void;
  setMenuSize: (size: LayoutSize) => void;
  update: (newContainerSize?: LayoutSize) => void;
}
