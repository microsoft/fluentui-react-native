import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState, AccessibilityActionEvent, LayoutAnimation, AccessibilityActionInfo } from 'react-native';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const useSwitch = (props: SwitchProps): SwitchInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    onChange,
    checked,
    defaultChecked,
    accessibilityRole,
    accessibilityLabel,
    onAccessibilityTap,
    onAccessibilityAction,
    label,
    labelPosition,
    componentRef = defaultComponentRef,
    disabled,
    ...rest
  } = props;

  const isDisabled = !!disabled;
  const initialCheckedState = !!(checked ?? defaultChecked);
  const [checkedState, setCheckedState] = React.useState(initialCheckedState);
  const focusRef = isDisabled ? null : componentRef;

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

  const accessibilityState: AccessibilityState = {
    checked: props.accessibilityState?.checked ?? currentCheckedState,
  };

  const accessibilityActionsProp: AccessibilityActionInfo[] = [{ name: 'Toggle' }];

  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      switch (event.nativeEvent.actionName) {
        case 'Toggle':
          toggleCallback(event); // will likely replace this with something else
          break;
      }
      onAccessibilityAction && onAccessibilityAction(event);
    },
    [toggleCallback, onAccessibilityAction],
  );

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: accessibilityRole ?? 'switch',
      onAccessibilityTap: onAccessibilityTap ?? onChange,
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      accessibilityActions: accessibilityActionsProp,
      onAccessibilityAction: onAccessibilityActionProp,
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

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
