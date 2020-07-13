import { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const contextualMenuName = 'ContextualMenu';

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
}

export type ContextualMenuSlotProps = {
  root: ICalloutProps;
};

export interface ContextualMenuType {
  props: ContextualMenuProps;
  slotProps: ContextualMenuSlotProps;
  tokens: ContextualMenuTokens;
}
