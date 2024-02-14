import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ButtonProps } from '@fluentui-react-native/button';
import type { LayoutTokens } from '@fluentui-react-native/framework';
import type { MenuProps } from '@fluentui-react-native/menu';
import type { LayoutRectangle, ViewProps, ViewStyle } from '@office-iss/react-native-win32';

export type LayoutSize = Pick<LayoutRectangle, 'width' | 'height'>;

export const overflowName = 'Overflow';

export interface OverflowProps extends ViewProps {
  padding?: ViewStyle['padding'];
  itemIDs: string[];
  dontHideBeforeReady?: boolean;
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

export interface OverflowState {
  hasOverflow: boolean;
  initialOverflowLayoutDone: boolean;
  itemVisibility: Record<string, boolean>;
  setLayoutState: (data: SetLayoutStateParam) => void;
  updateItemSize: (id: string, size: LayoutSize) => void;
  updateMenuSize: (size: LayoutSize) => void;
  updateOverflow: () => void;
}

export interface OverflowInfo {
  props: OverflowProps;
  state: OverflowState;
}

export const overflowItemName = 'OverflowItem';

export type OverflowItemProps = ButtonProps & {
  id: string;
};

export interface OverflowItemState {
  visible: boolean;
}

export interface OverflowItemInfo {
  props: OverflowItemProps;
  state: OverflowItemState;
}

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  showMenu: boolean;
  menuItems: string[];
}

export type OverflowMenuProps = MenuProps & {
  buttonProps?: ButtonProps;
};

export interface OverflowMenuInfo {
  props: OverflowMenuProps;
  state: OverflowMenuState;
}
