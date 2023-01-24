import * as React from 'react';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo, AnimationConfig } from './Switch.types';
import { AccessibilityState, AccessibilityActionEvent, Animated, Platform } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

const isMobile = Platform.OS === 'android' || Platform.OS == 'ios';

export const useSwitch = (props: SwitchProps, animationConfig?: AnimationConfig): SwitchInfo => {
  const defaultComponentRef = React.useRef(null);
  const [trackBackgroundAnimation] = React.useState(new Animated.Value(0));
  const animation = React.useRef(new Animated.Value(0)).current;
  const [isInit, setIsInit] = React.useState(true);
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

  const [checkedState, toggleCallback] = useAsToggleWithEvent(defaultChecked, checked, onChange);

  //Setting the initial position of the knob on track when page loads.
  React.useEffect(() => {
    if (isMobile) {
      Animated.timing(animation, {
        toValue: checkedState ? animationConfig.trackWidth - (animationConfig.thumbWidth + animationConfig.thumbMargin * 2) : 0,
        duration: isInit ? 0 : 300,
        useNativeDriver: false,
      }).start();

      const toValue = checkedState ? 0 : 1;
      Animated.timing(trackBackgroundAnimation, {
        toValue,
        duration: isInit ? 0 : 500,
        useNativeDriver: false,
      }).start();

      setIsInit(false);
    }
  }, [checked, checkedState]);

  const switchAnimationStyles = React.useMemo(() => {
    // transform over toggled on position to toggled off position and vice versa
    return {
      thumbAnimatedStyle: {
        transform: [
          {
            translateX: animation,
          },
        ],
      },
      // Interpolate over toggled on color to toggled off color and vice versa
      // Dividing the quadrants of interpolaton because this brings good intervals changes.
      trackBackgroundStyle: {
        backgroundColor: trackBackgroundAnimation.interpolate({
          inputRange: [0, 0.25, 0.75, 1],
          outputRange: checkedState
            ? [
                animationConfig.toggleOnBgColor,
                animationConfig.toggleOnBgColor,
                animationConfig.toggleOffBgColor,
                animationConfig.toggleOffBgColor,
              ]
            : [
                animationConfig.toggleOnBgColor,
                animationConfig.toggleOnBgColor,
                animationConfig.toggleOffBgColor,
                animationConfig.toggleOffBgColor,
              ],
        }),
      },
    };
  }, [checkedState]);

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
      accessible: isMobile ? !disabled : true,
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
