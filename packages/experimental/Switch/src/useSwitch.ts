import * as React from 'react';
import {
  usePressableState,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  InteractionEvent,
} from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { AccessibilityState, AccessibilityActionEvent, Platform, LayoutAnimation, UIManager } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

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
    accessibilityLabel,
    accessibilityActions,
    accessibilityState,
    accessibilityHint,
    onAccessibilityAction,
    ...rest
  } = props;

  // Use Layout Animation for Knob animating on state change
  const animateSwitchKnob = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut, () => {
        UIManager.setLayoutAnimationEnabledExperimental(false);
      });
    }
  };

  const onChangeWithAnimation = (e: InteractionEvent, checked?: boolean) => {
    onChange && onChange(e, checked);
    animateSwitchKnob();
  };

  const [checkedState, toggleCallback] = useAsToggleWithEvent(defaultChecked, checked, onChangeWithAnimation);
  const focusRef = disabled ? null : componentRef;

  if (__DEV__ && defaultChecked !== undefined && checked !== undefined) {
    console.warn("The props 'defaultChecked' and 'checked' are mutually exclusive. Use only one of the props, do not use both.");
  }

  if (labelPosition === 'after' || labelPosition === undefined) {
    if (__DEV__ && (!!props.onText || !!props.offText)) {
      console.warn(
        "The prop labelPosition's value of \"after\" and the props 'onText' or 'offText' are mutually exclusive. Try setting 'labelPosition' value to \"before\" or \"above\" instead.",
      );
    }
    props.onText = null;
    props.offText = null;
  }

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = usePressableState({ ...rest, onPress: onClickWithFocus });
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

  return {
    props: {
      accessible: true,
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityRole: accessibilityRole ?? 'switch',
      accessibilityActions: accessibilityActionsProp,
      onAccessibilityAction: onAccessibilityActionProp,
      accessibilityState: getAccessibilityState(checkedState, disabled, accessibilityState),
      disabled,
      focusable: !disabled,
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
