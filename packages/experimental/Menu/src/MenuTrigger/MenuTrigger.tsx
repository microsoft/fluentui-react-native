import React from 'react';
import { memoize, stagedComponent } from '@fluentui-react-native/framework';
import { menuTriggerName, MenuTriggerProps, MenuTriggerState } from './MenuTrigger.types';
import { useMenuTrigger } from './useMenuTrigger';
import { AccessibilityActionEvent } from 'react-native';

export const MenuTrigger = stagedComponent((props: MenuTriggerProps) => {
  const state = useMenuTrigger(props);

  return (_rest: MenuTriggerProps, children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length !== 1) {
        console.log('Only expecting one child for MenuTrigger');
      }
    }

    const child = childrenArray[0];
    const revisedState = getRevisedState(state, child.props);
    const revised = React.cloneElement(child, revisedState);

    return <>{revised}</>;
  };
});
MenuTrigger.displayName = menuTriggerName;

const getRevisedState = memoize(getRevisedStateWorker);
function getRevisedStateWorker(state: MenuTriggerState, props: any): MenuTriggerState {
  const revisedState = { ...state };
  if (props.accessibilityState) {
    revisedState.accessibilityState = { ...state.accessibilityState, ...props.accessibilityState };
  }

  if (props.accessibilityActions) {
    revisedState.accessibilityActions = { ...state.accessibilityActions, ...props.accessibilityActions };
  }

  if (props.onAccessibilityAction) {
    revisedState.onAccessibilityAction = (e: AccessibilityActionEvent) => {
      state.onAccessibilityAction(e);
      props.onAccessibilityAction(e);
    };
  }

  return revisedState;
}

export default MenuTrigger;
