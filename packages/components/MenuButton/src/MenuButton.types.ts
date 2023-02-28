import type { ButtonProps } from '@fluentui-react-native/button';
import type { ContextualMenuItemProps, ContextualMenuProps, SubmenuProps } from '@fluentui-react-native/contextual-menu';
import type { IconSourcesType } from '@fluentui-react-native/icon';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { IRenderData } from '@uifabricshared/foundation-composable';
import type { XmlProps } from 'react-native-svg';

export const MenuButtonName = 'MenuButton';

export interface MenuButtonContext {
  showContextualMenu?: boolean;
  primary?: boolean;
}

export interface MenuButtonState {
  context: MenuButtonContext;
}

export interface MenuButtonTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {}

export interface MenuButtonItemProps extends ContextualMenuItemProps {
  hasSubmenu?: boolean;
  submenuItems?: ContextualMenuItemProps[];
  submenuProps?: SubmenuProps;
  showSubmenu?: boolean;
}

export interface MenuButtonProps extends Omit<ButtonProps, 'icon'> {
  startIcon?: IconSourcesType;
  endIcon?: IconSourcesType;
  content?: string;
  menuItems?: MenuButtonItemProps[];
  onItemClick?: (key: string) => void;
  contextualMenu?: ContextualMenuProps;
  primary?: boolean;
}

export type MenuButtonSlotProps = {
  root: MenuButtonProps;
  button: ButtonProps & MenuButtonTokens & { content?: string };
  primaryButton: ButtonProps & MenuButtonTokens & { content?: string };
  contextualMenu: React.PropsWithRef<ContextualMenuProps>;
  contextualMenuItems: Pick<MenuButtonProps, 'menuItems'>;
  contextualMenuItem: MenuButtonItemProps;
  chevronSvg: XmlProps;
};

export type MenuButtonRenderData = IRenderData<MenuButtonSlotProps, MenuButtonState>;

export interface MenuButtonType {
  props: MenuButtonProps;
  slotProps: MenuButtonSlotProps;
  state: MenuButtonState;
  tokens: MenuButtonTokens;
}
