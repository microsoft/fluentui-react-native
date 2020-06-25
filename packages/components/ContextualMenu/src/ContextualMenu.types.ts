import { IRenderData } from '@uifabricshared/foundation-composable';
import { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const contextualMenuName = 'ContexualMenu';

/*
export interface IContextualMenuContext {
  /*
   ** The currently selected ContextMenu's key

  itemKey: string | null;

  /*
   ** Click handler which is invoked if onClick is not passed for individual contextual menu item. Returning true will dismiss the menu even if ev.preventDefault() was called.

  onItemClick?: (key: string) => boolean | void;
}


export interface IContextualMenuState {
  context: IContextualMenuContext;
}
*/

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
  // state: IContextualMenuState;
}
