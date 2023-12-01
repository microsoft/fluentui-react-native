import type { ButtonProps } from '@fluentui-react-native/button';
import type { ContextualMenuItemProps, ContextualMenuProps, SubmenuProps } from '@fluentui-react-native/contextual-menu';
import type { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import type { SvgProps, XmlProps } from 'react-native-svg';

export const menuButtonName = 'MenuButton';

export interface MenuButtonContext {
  showContextualMenu?: boolean;
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

export interface MenuButtonProps extends ButtonProps {
  menuItems?: MenuButtonItemProps[];
  onItemClick?: (key: string) => void;
  contextualMenu?: ContextualMenuProps;
  content?: string;
}

export type MenuButtonSlotProps = {
  root: MenuButtonProps;
  chevronIcon: SvgProps | XmlProps;
};

export interface MenuButtonType {
  props: MenuButtonProps;
  slotProps: MenuButtonSlotProps;
  state: MenuButtonState;
  tokens: MenuButtonTokens;
}
