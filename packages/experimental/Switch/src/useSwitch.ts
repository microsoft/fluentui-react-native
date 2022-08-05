import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { LayoutAnimation, AccessibilityState, AccessibilityInfo, AccessibilityActionEvent } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

const defaultAccessibilityActions = [{ name: 'Toggle' }];
const toggleAnimation = LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleX);

export const useSwitch = (props: SwitchProps): SwitchInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    onChange,
    checked,
    defaultChecked,
    label,
    labelPosition,
    componentRef = defaultComponentRef,
    disabled,
    accessibilityRole,
    accessibilityLabel,
    accessibilityActions,
    accessibilityState,
    accessibilityHint,
    onAccessibilityAction,
    ...rest
  } = props;

  const isDisabled = !!disabled;
  const [checkedState, toggleCallback] = useAsToggleWithEvent(defaultChecked, checked, onChange);
  const focusRef = isDisabled ? null : componentRef;
  const isFirstRender = React.useRef(true);

  if (__DEV__ && defaultChecked !== undefined && checked !== undefined) {
    console.warn('The props defaultChecked and checked are mutually exclusive. Use only one of the props, do not use both.');
  }

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(toggleCallback, ' ', 'Enter');

  const accessibilityActionsProp = accessibilityActions
    ? [...defaultAccessibilityActions, ...accessibilityActions]
    : defaultAccessibilityActions;

  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      switch (event.nativeEvent.actionName) {
        case 'Toggle':
          toggleCallback(event);
          break;
      }
      onAccessibilityAction && onAccessibilityAction(event);
    },
    [toggleCallback, onAccessibilityAction],
  );

  // Triggers animation only when the checked state changes
  React.useLayoutEffect(() => {
    // The `isFirstRender` value lets us apply the animation effect after the control mounts
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (AccessibilityInfo.isReduceMotionEnabled) {
      LayoutAnimation.configureNext(toggleAnimation);
    }
  }, [checkedState]);

  return {
    props: {
      accessible: true,
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityRole: accessibilityRole ?? 'switch',
      accessibilityActions: accessibilityActionsProp,
      onAccessibilityAction: onAccessibilityActionProp,
      accessibilityState: getAccessibilityState(checkedState, isDisabled, accessibilityState),
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      checked: checkedState,
      labelPosition: labelPosition ?? 'after',
      ...pressable.props,
      ...onKeyUpProps,
      ...props,
    },
    state: {
      ...pressable.state,
      toggled: checkedState,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(checked: boolean, disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { checked, disabled, ...accessibilityState };
  }
  return { checked, disabled };
}
