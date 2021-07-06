import { ContextualMenuItemProps, ContextualMenuProps } from '@fluentui-react-native/contextual-menu';
import { IButtonProps } from '@fluentui-react-native/button';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IconProps } from '@fluentui-react-native/icon';

export const MenuButtonName = 'MenuButton';

export interface MenuButtonContext {
  showContextualMenu?: boolean;
}

export interface MenuButtonState {
  context: MenuButtonContext;
}

export interface MenuButtonItemProps extends ContextualMenuItemProps {
  submenu?: boolean;
  submenuItems?: ContextualMenuItemProps[];
}

export interface MenuButtonProps {
  menuItems?: MenuButtonItemProps[];
  content?: string;
  onItemClick?: (key: string) => void;
  disabled?: boolean;
  icon?: number | string | IconProps;
  contextualMenu?: ContextualMenuProps;
}

export type MenuButtonSlotProps = {
  root: MenuButtonProps;
  button: IButtonProps;
  contextualMenu: React.PropsWithRef<ContextualMenuProps>;
  contextualMenuItems: Pick<MenuButtonProps, 'menuItems'>;
  contextualMenuItem: MenuButtonItemProps;
};

export type MenuButtonRenderData = IRenderData<MenuButtonSlotProps, MenuButtonState>;

export interface MenuButtonType {
  props: MenuButtonProps;
  slotProps: MenuButtonSlotProps;
  state: MenuButtonState;
}
