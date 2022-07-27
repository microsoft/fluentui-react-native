import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchState } from './Switch.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState, LayoutAnimation } from 'react-native';

export const useSwitch = (props: SwitchProps): SwitchState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, checked, accessibilityState, componentRef = defaultComponentRef, disabled, ...rest } = props;
  const isDisabled = !!disabled;
  const [checkedState, setCheckedState] = React.useState(checked);
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;

  const toggleCallback = (e: any) => {
    const newCheckedState = !checkedState;
    onClick && onClick(e, newCheckedState);

    LayoutAnimation.configureNext(LayoutAnimation.create(250, LayoutAnimation.Types.linear, LayoutAnimation.Properties.scaleX));
    setCheckedState(newCheckedState);
  };

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(toggleCallback, ' ', 'Enter');
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'switch',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: true,
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      checked: props.checked || false,
    },
    state: {
      ...pressable.state,
      toggleOn: checkedState == true,
      toggleOff: checkedState == false,
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
