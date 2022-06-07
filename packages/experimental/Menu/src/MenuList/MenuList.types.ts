import type { IViewProps } from '@fluentui-react-native/adapters';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {
  gap?: number;
}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {
  checked?: string[];
  defaultChecked?: string[];
  hasCheckmarks?: boolean;
  onCheckedChange?: (e: InteractionEvent, checked: string[]) => void;
}

export interface MenuListState extends Omit<MenuListProps, 'checked' | 'onCheckedChange'> {
  checked?: Record<string, boolean>;
  isCheckedControlled: boolean;
  onCheckedChange?: (e: InteractionEvent, name: string, isChecked: boolean) => void;
  selectRadio?: (e: InteractionEvent, name: string) => void;
  addRadioItem: (name: string) => void;
  removeRadioItem: (name: string) => void;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps> & { gap?: number };
}

export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
