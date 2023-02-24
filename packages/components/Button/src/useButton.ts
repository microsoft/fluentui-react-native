import * as React from 'react';

import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { ButtonProps, ButtonInfo } from './Button.types';

export const useButton = (props: ButtonProps): ButtonInfo => {
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityRole, componentRef = defaultComponentRef, disabled, loading, enableFocusRing, focusable, ...rest } = props;
  const isDisabled = !!disabled || !!loading;
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const pressable = usePressableState({ ...rest, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(onClick, ' ', 'Enter');
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  return {
    props: {
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      /**
       * https://github.com/facebook/react-native/issues/34986
       * Due to a bug in React Native, unconditionally passing this may cause unnecessary re-renders.
       * Therefore, let's only pass it in if it's defined to limit this issue.
       */
      ...(isDisabled && { disabled: isDisabled }),
      accessible: true,
      accessibilityRole: accessibilityRole || 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      enableFocusRing: enableFocusRing ?? true,
      focusable: focusable ?? !isDisabled,
      ref: useViewCommandFocus(componentRef),
      iconPosition: props.iconPosition || 'before',
      loading,
    },
    state: pressable.state,
  };
};
