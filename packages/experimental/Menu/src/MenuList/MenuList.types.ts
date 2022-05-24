import type { IViewProps } from '@fluentui-react-native/adapters';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {
  gap?: number;
}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {
  checked?: Record<string, boolean>;
  defaultChecked?: Record<string, boolean>;
  hasCheckmarks?: boolean;
  onCheckedChange?: (e: InteractionEvent, name: string, isChecked: boolean) => void;
}

export interface MenuListState extends MenuListProps {
  isCheckedControlled: boolean;
  selectRadio?: (e: InteractionEvent, name: string, isChecked: boolean) => void;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps> & { gap?: number };
}
export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
