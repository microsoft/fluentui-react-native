import type { View, ViewProps, ViewStyle } from 'react-native';

import type { LayoutRectangle } from '@office-iss/react-native-win32';

import type { OverflowItemEntry, OverflowUpdatePayload } from '../overflowManager.types';

export type LayoutSize = Pick<LayoutRectangle, 'width' | 'height'>;

export const overflowName = 'Overflow';

export interface OverflowProps extends ViewProps {
  /** Set true to turn on logs in the overflow manager */
  debug?: boolean;
  /**  Horizontal padding to add to the container */
  padding?: ViewStyle['padding'];
  /**  List of all IDs that will be rendered in the overflow container */
  itemIDs: string[];
  /**  By default, the overflow container's opacity is set to 0 while the overflow manager figures out which items should be hidden due to noticable pop-in. */
  /**  This flag sets the opacity to always be visible. */
  dontHideBeforeReady?: boolean;
  /**  Callback triggering whenever the visibility of one or more items changes */
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

type MenuSetLayoutStateParam = { type: 'menu'; layoutDone: boolean };
type ItemSetLayoutStateParam = { type: 'item'; id: string; layoutDone: boolean };
export type SetLayoutStateParam = MenuSetLayoutStateParam | ItemSetLayoutStateParam;

export type OverflowItemVisibilityChangePayload = {
  id: string;
  type: 'visibility';
  visible: boolean;
};
export type OverflowItemLayoutChangePayload = {
  id: string;
  type: 'layout';
  newLayout: LayoutSize | null;
};
export type OverflowItemChangePayload = OverflowItemVisibilityChangePayload | OverflowItemLayoutChangePayload;
export type OverflowItemChangeHandler = (data: OverflowItemChangePayload) => void;

// Data passed to the Overflow Context
export interface OverflowState {
  /** Size of the Overflow Container */
  containerSize: LayoutSize | null;
  /**  Flag set to true when one or more items are hidden by the manager */
  hasOverflow: boolean;
  /**  Flag set to true once the overflow manager runs its first calculation to see which items should initially be visible / hidden */
  initialOverflowLayoutDone: boolean;
  /**  Map with item IDs as keys and their boolean visibilities as entries */
  itemVisibility: Record<string, boolean>;
  /**  The component ref to pass to the OverflowMenu's trigger */
  overflowMenuRef?: React.RefObject<View>;
  /**  Called by OverflowItem when mounting, used to add item to overflow manager */
  register: (id: string, onItemChange: OverflowItemChangeHandler) => void;
  /**  Called by OverflowITem when unmounting */
  disconnect: (id: string) => void;
  /**  Method called by overflow menu trigger / overflow item to signal that initial layout has finished */
  setLayoutState: (data: SetLayoutStateParam) => void;
  /**  Called to update OverflowItem's layout info / priority */
  updateItem: (item: OverflowItemEntry) => void;
  /**  Used to set OverflowMenu trigger's size */
  updateMenuSize: (size: LayoutSize) => void;
  /**  Used to force the overflow manager to run its `update()` method */
  updateOverflow: () => void;
}

export interface OverflowInfo {
  props: OverflowProps;
  state: OverflowState;
}
