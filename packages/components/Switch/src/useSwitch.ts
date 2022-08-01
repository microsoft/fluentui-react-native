import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { LayoutAnimation } from 'react-native';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

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
  const focusRef = isDisabled ? null : componentRef;

  if (defaultChecked !== undefined && checked !== undefined) {
    console.warn('The props defaultChecked and checked are mutually exclusive. Use only one of the props, do not use both.');
  }

  const toggleCallback = React.useCallback(
    (e: InteractionEvent) => {
      const newCheckedState = checked !== undefined ? checked : !checkedState;
      onChange && onChange(newCheckedState, e);
      LayoutAnimation.configureNext(LayoutAnimation.create(200, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleX));
      setCheckedState(newCheckedState);
    },
    [onChange, setCheckedState, checkedState, checked],
  );

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(toggleCallback, ' ', 'Enter');
  const currentCheckedState = checked ?? checkedState;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: accessibilityRole ?? 'switch',
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      checked: currentCheckedState,
      label: label,
      labelPosition: labelPosition ?? 'after',
    },
    state: {
      ...pressable.state,
      toggleOn: currentCheckedState == true,
      toggleOff: currentCheckedState == false,
    },
  };
};
