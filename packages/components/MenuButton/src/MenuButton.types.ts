import { ContextualMenuItemProps, ContextualMenuProps, SubmenuProps } from '@fluentui-react-native/contextual-menu';
import { IButtonProps } from '@fluentui-react-native/button';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const MenuButtonName = 'MenuButton';

export interface MenuButtonContext {
  showContextualMenu?: boolean;
}

export interface MenuButtonState {
  context: MenuButtonContext;
}

export interface MenuButtonItemProps extends ContextualMenuItemProps {
  hasSubmenu?: boolean;
  submenuItems?: ContextualMenuItemProps[];
  submenuProps?: SubmenuProps;
  showSubmenu?: boolean;
}

export interface MenuButtonProps extends IButtonProps {
  menuItems?: MenuButtonItemProps[];
  onItemClick?: (key: string) => void;
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
