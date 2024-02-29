import type { View, ViewProps, ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { LayoutTokens } from '@fluentui-react-native/framework';
import type { LayoutRectangle } from '@office-iss/react-native-win32';

import type { OverflowItemEntry, OverflowUpdatePayload } from '../overflowManager.types';

export type LayoutSize = Pick<LayoutRectangle, 'width' | 'height'>;

export const overflowName = 'Overflow';

export interface OverflowProps extends ViewProps {
  padding?: ViewStyle['padding'];
  itemIDs: string[];
  dontHideBeforeReady?: boolean;
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

export type OverflowTokens = LayoutTokens & {
  axis?: 'horizontal' | 'vertical';
  opacity?: ViewStyle['opacity'];

  hidden?: OverflowTokens;
};

export interface OverflowSlotProps {
  root: IViewProps;
}

export interface OverflowType {
  props: OverflowProps;
  slotProps: OverflowSlotProps;
  tokens: OverflowTokens;
}

type MenuSetLayoutStateParam = { type: 'menu'; layoutDone: boolean };
type ItemSetLayoutStateParam = { type: 'item'; id: string; layoutDone: boolean };
export type SetLayoutStateParam = MenuSetLayoutStateParam | ItemSetLayoutStateParam;

type OverflowItemChangePayloadBase = { id: string };
type OverflowItemVisibilityChangePayload = OverflowItemChangePayloadBase & { type: 'visibility'; visible: boolean };
type OverflowItemLayoutChangePayload = OverflowItemChangePayloadBase & { type: 'layout'; newLayout: LayoutSize | null };
export type OverflowItemChangePayload = OverflowItemVisibilityChangePayload | OverflowItemLayoutChangePayload;
export type OverflowItemChangeHandler = (data: OverflowItemChangePayload) => void;

export interface OverflowState {
  hasOverflow: boolean;
  initialOverflowLayoutDone: boolean;
  itemVisibility: Record<string, boolean>;
  overflowMenuRef?: React.RefObject<View>;
  register: (id: string, onItemChange: OverflowItemChangeHandler) => void;
  disconnect: (id: string) => void;
  setLayoutState: (data: SetLayoutStateParam) => void;
  updateItem: (item: OverflowItemEntry) => void;
  updateMenuSize: (size: LayoutSize) => void;
  updateOverflow: () => void;
}

export interface OverflowInfo {
  props: OverflowProps;
  state: OverflowState;
}
