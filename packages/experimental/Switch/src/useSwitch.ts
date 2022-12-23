import * as React from 'react';
import {
  usePressableState,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  InteractionEvent,
} from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { AccessibilityState, AccessibilityActionEvent, Animated, Platform } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

const startTrackBackgroundAnimation = (checked: boolean, animation: Animated.Value) => {
  const toValue = checked ? 0 : 1;
  Animated.timing(animation, {
    toValue,
    duration: 500,
    useNativeDriver: false,
  }).start();
};

const startTrackAnimation = (onInit = false, bgColor: any, animation: Animated.Value, toggled: boolean) => {
  Animated.timing(animation, {
    toValue: toggled ? bgColor.width - (bgColor.thumbWidth + bgColor.thumbMargin * 2) : onInit ? 0 : -(bgColor.width + bgColor.thumbWidth),
    duration: 300,
    useNativeDriver: true,
  }).start();
};

export const useSwitch = (
  props: SwitchProps,
  bgColor?: { on: string; off: string; width: number; thumbWidth: number; thumbMargin: number },
): SwitchInfo => {
  const defaultComponentRef = React.useRef(null);
  const [animation] = React.useState(new Animated.Value(0));
  const [trackBackgroundAnimation] = React.useState(new Animated.Value(0));

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

  const onChangeWithAnimation = React.useCallback(
    (e: InteractionEvent, checked?: boolean) => {
      onChange && onChange(e, checked);
      if (Platform.OS === 'android') {
        if (checked) {
          startTrackBackgroundAnimation(checked, trackBackgroundAnimation);
          startTrackAnimation(false, bgColor, animation, checked);
        } else {
          startTrackBackgroundAnimation(checked, trackBackgroundAnimation);
          startTrackAnimation(false, bgColor, animation, checked);
        }
      }
    },
    [onChange],
  );

  const [checkedState, toggleCallback] = useAsToggleWithEvent(defaultChecked, checked, onChangeWithAnimation);

  const switchAnimationStyles = {
    thumbAnimatedStyle: {
      transform: [
        {
          translateX: animation,
        },
      ],
    },
    trackBackgroundStyle: {
      backgroundColor: trackBackgroundAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: checkedState ? [bgColor.on, bgColor.on] : [bgColor.off, bgColor.off],
      }),
    },
  };

  if (Platform.OS === 'android') {
    if (checkedState) {
      startTrackAnimation(false, bgColor, animation, checkedState);
      startTrackBackgroundAnimation(true, trackBackgroundAnimation);
    } else {
      startTrackAnimation(true, bgColor, animation, checkedState);
      startTrackBackgroundAnimation(false, trackBackgroundAnimation);
    }
  }

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
      switchAnimationStyles: switchAnimationStyles,
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
