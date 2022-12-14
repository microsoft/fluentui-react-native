import * as React from 'react';
import {
  usePressableState,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  InteractionEvent,
} from '@fluentui-react-native/interactive-hooks';
import { SwitchProps, SwitchInfo } from './Switch.types';
import { AccessibilityState, AccessibilityActionEvent, Platform, LayoutAnimation, UIManager, Animated } from 'react-native';
import { buildUseStyling, memoize } from '@fluentui-react-native/framework';
import { useAsToggleWithEvent } from '@fluentui-react-native/interactive-hooks';
import { stylingSettings } from './Switch.styling';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

// // Use Layout Animation for Knob animating on state change
// const animateSwitchKnob = () => {
//   if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut, () => {
//       UIManager.setLayoutAnimationEnabledExperimental(false);
//     });
//   }
// };

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

  const onChangeWithAnimation = React.useCallback(
    (e: InteractionEvent, checked?: boolean) => {
      onChange && onChange(e, checked);
      console.log('Checked ' + checked);
      if (checked) {
        startAnimatiobgn(checked);
        startAnimation();
      } else {
        startAnimatiobgn(checked);
        startAnimation2();
      }
    },
    [onChange],
  );

  const [animation, setAnimation] = React.useState(new Animated.Value(0));
  const [animationbg, setAnimationbg] = React.useState(new Animated.Value(0));

  const animatedStyles = {
    animatedStyle: {
      transform: [
        {
          translateX: animation,
        },
      ],
    },
    backgroundStyle: {
      // backgroundColor: animationbg.interpolate({
      //   inputRange: [0, 1],
      //   outputRange: ['green', 'red'],
      // }),
    },
  };

  const [checkedState, toggleCallback] = useAsToggleWithEvent(defaultChecked, checked, onChangeWithAnimation);
  console.log('CHECKE STATED ' + checkedState);
  const startAnimation = () => {
    Animated.timing(animation, {
      toValue: tokens.track.style.width - tokens.thumb.style.width - tokens.thumb.style.margin * 2,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const startAnimatiobgn = (checkss) => {
    const toValue = checkss ? 0 : 1;
    Animated.timing(animationbg, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const startAnimation2 = (first = false) => {
    Animated.timing(animation, {
      toValue: first ? 0 : -20,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (checkedState) {
    startAnimation();
    startAnimatiobgn(true);
  } else {
    startAnimation2(true);
    startAnimatiobgn(false);
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
      animatedStyles: animatedStyles,
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
