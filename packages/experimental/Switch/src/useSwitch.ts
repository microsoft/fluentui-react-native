import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { LayoutAnimation } from 'react-native';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

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
  const initialCheckedState = !!(checked ?? defaultChecked);
  const [checkedState, setCheckedState] = React.useState(initialCheckedState);
  const [prevCheckedState, setPrevCheckedState] = React.useState(initialCheckedState);
  const focusRef = isDisabled ? null : componentRef;

  if (defaultChecked !== undefined && checked !== undefined) {
    console.warn('The props defaultChecked and checked are mutually exclusive. Use only one of the props, do not use both.');
  }

  const toggleCallback = React.useCallback(
    (e: InteractionEvent) => {
      const newCheckedState = checked !== undefined ? checked : !checkedState;
      onChange && onChange(newCheckedState, e);
      setCheckedState(newCheckedState);
    },
    [onChange, setCheckedState, checkedState, checked],
  );

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(toggleCallback, ' ', 'Enter');
  const currentCheckedState = checked ?? checkedState;

  // Triggers animation only when the checked state changes
  if (prevCheckedState !== currentCheckedState) {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleX));
    setPrevCheckedState(currentCheckedState);
  }

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: accessibilityRole ?? 'switch',
      accessibilityState: { disabled: disabled, checked: currentCheckedState }, // Needed for E2E Testing to detect toggle state, will provide a better implementation in a Accessibility PR
      accessibilityActions: defaultAccessibilityActions, // Needed for E2E Testing to detect toggle state, will provide a better implementation in a Accessibility PR
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      checked: currentCheckedState,
      label: label,
      labelPosition: labelPosition ?? 'after',
    },
    state: {
      ...pressable.state,
      toggled: currentCheckedState,
    },
  };
};
