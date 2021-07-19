import {
  ContextualMenuItemProps,
  ContextualMenuProps,
  SubmenuProps,
  SubmenuTokens,
  ContextualMenuTokens,
  SubmenuItemTokens,
} from '@fluentui-react-native/contextual-menu';
import { IButtonProps, IButtonTokens } from '@fluentui-react-native/button';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const MenuButtonName = 'MenuButton';

export interface MenuButtonContext {
  showContextualMenu?: boolean;
}

export interface MenuButtonState {
  context: MenuButtonContext;
}

export type MenuButtonTokens = SubmenuTokens & SubmenuItemTokens & ContextualMenuTokens & IButtonTokens;

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
  tokens: MenuButtonTokens;
}
