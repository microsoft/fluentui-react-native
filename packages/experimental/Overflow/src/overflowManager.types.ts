import type { LayoutSize } from './Overflow/Overflow.types';

export interface OverflowItemEntry {
  id: string;
  size: LayoutSize;
  priority?: number;
  initialOrder?: number;
}

export interface ItemVisibilityUpdatePayload {
  id: string;
  visible: boolean;
}

export interface OverflowUpdatePayload {
  visibleIds: string[];
  invisibleIds: string[];
  layoutChange?: {
    id: string;
    newWidth: number;
  };
}

export interface ItemDimensionUpdatePayload {
  id: string;
  update: LayoutSize | null;
}

export interface OverflowManagerOptions {
  debug?: boolean;
  initialContainerSize: LayoutSize;
  padding?: number;
  onUpdateItemDimension?: (data: ItemDimensionUpdatePayload) => void;
  onUpdateItemVisibility?: (data: ItemVisibilityUpdatePayload) => void;
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

export interface OverflowManager {
  initialize: (options: OverflowManagerOptions) => void;
  addItem: (entry: OverflowItemEntry) => void;
  hasItem: (id: string) => boolean;
  removeItem: (id: string) => void;
  updateItem: (id: string, update: Partial<OverflowItemEntry>) => void;
  setMenuSize: (size: LayoutSize) => void;
  update: (newContainerSize?: LayoutSize) => void;
}
