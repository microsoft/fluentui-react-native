import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { LayoutAnimation, AccessibilityInfo } from 'react-native';
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
      ...pressable.props,
      accessible: true,
      accessibilityRole: accessibilityRole ?? 'switch',
      accessibilityState: { disabled: disabled, checked: checkedState }, // Needed for E2E Testing to detect toggle state, will provide a better implementation in a Accessibility PR
      accessibilityActions: defaultAccessibilityActions, // Needed for E2E Testing to detect toggle state, will provide a better implementation in a Accessibility PR
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      checked: checkedState,
      label: label,
      labelPosition: labelPosition ?? 'after',
    },
    state: {
      ...pressable.state,
      toggled: checkedState,
    },
  };
};
