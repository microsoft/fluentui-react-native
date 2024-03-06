import type { LayoutSize } from './Overflow/Overflow.types';

/** Data entered for a single overflow item */
export interface OverflowItemEntry {
  /** Required overflowID of an item */
  id: string;
  /** Width and height of an item */
  size: LayoutSize;
  /** Optional priority given to the item specified by the user */
  priority?: number;
  /** Order in which the item was registered under the manager, not assigned by the user */
  initialOrder?: number;
}

/** Event payload sent when a single item's visibility changes */
export interface ItemVisibilityUpdatePayload {
  id: string;
  visible: boolean;
}

/** Event payload sent when a visibility update should complete, with the new visible / invisible ids shown */
export interface OverflowUpdatePayload {
  visibleIds: string[];
  invisibleIds: string[];
}

/**
 * Event payload sent when an item's dimensions should change.
 *
 * This happens when there is a single remaining item that should be truncated when its dimensions exceed the space of the overflow container. */
export interface ItemDimensionUpdatePayload {
  id: string;
  update: LayoutSize | null;
}

/** Options to initialize a FURN overflow manager. */
export interface OverflowManagerOptions {
  /** Flag to enable debug logs in the overflow manager */
  debug?: boolean;
  /** Width and height of overflow container */
  initialContainerSize: LayoutSize;
  /** Padding of container (width right now, will add support for height later) */
  padding?: number;
  /** Callback passed for handling when the last item of an overflow menu should shrink / grow */
  onUpdateItemDimension?: (data: ItemDimensionUpdatePayload) => void;
  /** Callback passed for handling when an individual item's visibility changes */
  onUpdateItemVisibility?: (data: ItemVisibilityUpdatePayload) => void;
  /** Callback passed for handling the overall update for an overflow's item visibilities */
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

/** Methods exposed by the overflow manager */
export interface OverflowManager {
  /** Initialize the overflow manager with user-passed parameters */
  initialize: (options: OverflowManagerOptions) => void;
  /** Add a new overflow item to the manager */
  addItem: (entry: OverflowItemEntry) => void;
  /** Check if an overflow item exists within the manager */
  hasItem: (id: string) => boolean;
  /** Delete an overflow item from the manager */
  removeItem: (id: string) => void;
  /** Used to update either the size or priority of a given item. */
  updateItem: (id: string, update: Partial<OverflowItemEntry>) => void;
  /** Update overflow manager with the overflow menu trigger's width and height */
  setMenuSize: (size: LayoutSize) => void;
  /** Should run whenever the overflow container receives a layout event.  */
  update: (newContainerSize?: LayoutSize) => void;
}
