import { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const contextualMenuName = 'ContextualMenu';

export interface ContextualMenuContext {
  /*
   ** The currently selected ContextualMenu's key
   */
  selectedKey: string | null;

  /*
   ** Updates the clicked menu item and calls the client’s onItemClick callback
   */
  onItemClick?: (key: string) => void;
  /*
   ** Parent menu's onDismiss callback that is passed into submenu to call when submenu item is clicked
   */
  onDismissMenu?: () => void;
  /*
   ** Checks if any child menus are open
   */
  isSubmenuOpen?: boolean;
  /*
   ** ContextualMenuItems will call this submenu dismissal when they are hovered
   */
  dismissSubmenu?: () => void;

  setSubmenuItemHovered?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ContextualMenuState {
  context: ContextualMenuContext;
}

export type ContextualMenuTokens = ICalloutTokens;
/**
 * Properties and Tokens for FluentUI React Native ContextualMenu
 */

export interface ContextualMenuProps extends Omit<ICalloutProps, 'setInitialFocus'> {
  /*
   * Whether to set initial focus on the contextual menu container, as opposed to the first menu item.
   */
  shouldFocusOnContainer?: boolean;

  /*
   * Whether to focus on the menu when mounted
   */
  shouldFocusOnMount?: boolean;
  /*
   ** Callback for when menu item is clicked
   */
  onItemClick?: (key: string) => void;
  /*
   ** Callback to toggle showContextualMenu to false and close menu on item click
   */
  setShowMenu?: (showMenu: boolean) => void;
}

export type ContextualMenuSlotProps = {
  root: ContextualMenuProps;
  container: ViewProps;
};

export type ContextualMenuRenderData = IRenderData<ContextualMenuSlotProps, ContextualMenuState>;

export interface ContextualMenuType {
  props: ContextualMenuProps;
  slotProps: ContextualMenuSlotProps;
  tokens: ContextualMenuTokens;
  state: ContextualMenuState;
}
