import { IRenderData } from '@uifabricshared/foundation-composable';
import { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const contextualMenuName = 'ContexualMenu';

export type IContextualMenuTokens = ICalloutTokens;
/**
 * Properties and Tokens for FluentUI React Native ContextualMenu
 */

export interface IContextualMenuProps extends Omit<ICalloutProps, 'setInitialFocus'> {
  /*
  * Whether to set initial focus on the contextual menu container, as opposed to the first menu item.
  */
  shouldFocusOnContainer?: boolean;

  /*
  * Whether tofocus on the menu when mounted
  */
  shouldFocusOnMount?: boolean;
}

export type IContextualMenuSlotProps = {
  root: ICalloutProps;
};

export type IContextualMenuRenderData = IRenderData<IContextualMenuSlotProps>;

export interface IContextualMenuType {
  props: IContextualMenuProps;
  slotProps: IContextualMenuSlotProps;
  tokens: IContextualMenuTokens;
}
