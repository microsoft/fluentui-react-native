import type { IViewProps } from '@fluentui-react-native/adapters';
import { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {
  hasCheckmarks?: boolean;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps>;
}
export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
