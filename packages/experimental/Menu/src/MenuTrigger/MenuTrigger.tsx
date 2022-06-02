import React from 'react';
import { memoize, stagedComponent } from '@fluentui-react-native/framework';
import { menuTriggerName, MenuTriggerProps, MenuTriggerState } from './MenuTrigger.types';
import { useMenuTrigger } from './useMenuTrigger';
import { AccessibilityActionEvent } from 'react-native';
import { MenuTriggerProvider } from '../context/menuTriggerContext';

export const MenuTrigger = stagedComponent((props: MenuTriggerProps) => {
  const menuTrigger = useMenuTrigger(props);

  return (_rest: MenuTriggerProps, children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.log('Only expecting one child for MenuTrigger');
      }
    }

    // In order to properly support accessibility without erasing props set on the
    // child component which may affect accessibility, we need to modify the
    // state in the inner render so we can access the child component and its props.
    const child = childrenArray[0];
    const revisedState = getRevisedState(menuTrigger, child.props);
    const revised = React.cloneElement(child, revisedState);

    return <MenuTriggerProvider value={menuTrigger.hasSubmenu}>{revised}</MenuTriggerProvider>;
  };
});
MenuTrigger.displayName = menuTriggerName;

const getRevisedState = memoize(getRevisedStateWorker);
function getRevisedStateWorker(state: MenuTriggerState, props: any): MenuTriggerState {
  const revisedState = { ...state };
  if (props.accessibilityState) {
    revisedState.props.accessibilityState = { ...state.props.accessibilityState, ...props.accessibilityState };
  }

  if (props.accessibilityActions) {
    revisedState.props.accessibilityActions = { ...state.props.accessibilityActions, ...props.accessibilityActions };
  }

  if (props.onAccessibilityAction) {
    revisedState.props.onAccessibilityAction = (e: AccessibilityActionEvent) => {
      state.props.onAccessibilityAction(e);
      props.onAccessibilityAction(e);
    };
  }

  return revisedState;
}

export default MenuTrigger;
