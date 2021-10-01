import { ContextualMenuItemProps, ContextualMenuProps, SubmenuProps } from '@fluentui-react-native/contextual-menu';
import { ButtonProps, ButtonTokens } from '@fluentui-react-native/experimental-button';
import { SvgProps, XmlProps } from 'react-native-svg';

export const menuButtonName = 'MenuButton';

export interface MenuButtonState {
  showContextualMenu?: boolean;
}

export interface MenuButtonTokens extends ButtonTokens {}

export interface MenuButtonItemProps extends ContextualMenuItemProps {
  hasSubmenu?: boolean;
  submenuItems?: ContextualMenuItemProps[];
  submenuProps?: SubmenuProps;
  showSubmenu?: boolean;
}

export interface MenuButtonProps extends ButtonProps {
  menuItems?: MenuButtonItemProps[];
  onItemClick?: (key: string) => void;
  contextualMenu?: ContextualMenuProps;
}

export type MenuButtonSlotProps = {
  root: MenuButtonProps;
  button: ButtonProps;
  chevronIcon: SvgProps | XmlProps;
};

export interface MenuButtonInfo {
  props: MenuButtonProps;
  state: MenuButtonState;
}

export interface MenuButtonType {
  props: MenuButtonProps;
  slotProps: MenuButtonSlotProps;
  state: MenuButtonState;
  tokens: MenuButtonTokens;
}
