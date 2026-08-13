import * as React from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from 'react-native';

import { usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import type { SwitchProps, SwitchState } from './switch.types';

const TOGGLE_KEYS = new Set(['Enter', ' ', 'Spacebar', 'Space']);

function isToggleKey(key: string | undefined): boolean {
  return key !== undefined && TOGGLE_KEYS.has(key);
}

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotion;
}

/**
 * Resolve the Switch component state, slots, accessibility, and interactive behavior.
 */
export function useSwitch_unstable(props: SwitchProps): SwitchState {
  const {
    aboveLabel: aboveLabelProp,
    accessibilityLabel,
    accessibilityLabelledBy,
    afterLabel: afterLabelProp,
    beforeLabel: beforeLabelProp,
    checked: checkedProp,
    defaultChecked = false,
    disabled = false,
    label = 'Label',
    labelAfter = true,
    labelBefore = true,
    layout = 'horizontal',
    onChange,
    thumb: thumbProp,
    style: userStyle,
    track: trackProp,
    ...rest
  } = props;

  const isControlled = checkedProp !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const checked = (isControlled ? checkedProp : uncontrolledChecked) ?? false;
  const hasBeforeLabel = layout === 'horizontal' && labelBefore && beforeLabelProp !== null;
  const hasAfterLabel = layout === 'horizontal' && labelAfter && afterLabelProp !== null;
  const hasAboveLabel = layout === 'vertical' && aboveLabelProp !== null;
  const hasVisibleLabel = hasBeforeLabel || hasAfterLabel || hasAboveLabel;
  const themeState = useThemeState();
  const reduceMotion = useReduceMotion();
  const checkedProgress = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
  const hasMounted = React.useRef(false);
  const switchId = React.useId().replaceAll(':', '');
  const beforeLabelId = `switch-${switchId}-before`;
  const afterLabelId = `switch-${switchId}-after`;
  const aboveLabelId = `switch-${switchId}-above`;

  const explicitAccessibleName =
    accessibilityLabel !== undefined || accessibilityLabelledBy !== undefined || rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined;

  React.useEffect(() => {
    if (__DEV__ && !hasVisibleLabel && !explicitAccessibleName && (!label || label === 'Label')) {
      console.warn('Switch: standalone switches require an accessibilityLabel when no visible labels are rendered.');
    }
  }, [explicitAccessibleName, hasVisibleLabel, label]);

  React.useEffect(() => {
    if (!hasMounted.current) {
      checkedProgress.setValue(checked ? 1 : 0);
      hasMounted.current = true;
      return;
    }

    if (reduceMotion) {
      checkedProgress.setValue(checked ? 1 : 0);
      return;
    }

    Animated.timing(checkedProgress, {
      toValue: checked ? 1 : 0,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [checked, checkedProgress, reduceMotion]);

  const commitChecked = React.useCallback(
    (nextChecked: boolean) => {
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }
      onChange?.(nextChecked);
    },
    [isControlled, onChange],
  );

  const pressableNameProps =
    explicitAccessibleName || !hasVisibleLabel
      ? {
          accessibilityLabel: accessibilityLabel ?? (!hasVisibleLabel ? label : undefined),
          accessibilityLabelledBy,
          'aria-label': rest['aria-label'],
          'aria-labelledby': rest['aria-labelledby'],
        }
      : {
            accessibilityLabel: label,
            accessibilityLabelledBy: [hasBeforeLabel ? beforeLabelId : undefined, hasAfterLabel ? afterLabelId : undefined, hasAboveLabel ? aboveLabelId : undefined].filter(
              Boolean,
            ) as string[],
          'aria-labelledby': [hasBeforeLabel ? beforeLabelId : undefined, hasAfterLabel ? afterLabelId : undefined, hasAboveLabel ? aboveLabelId : undefined]
            .filter(Boolean)
            .join(' '),
        };

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    ...pressableNameProps,
    accessibilityRole: 'switch',
    accessibilityState: {
      ...rest.accessibilityState,
      checked,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
    'aria-checked': checked,
  });

  const handlePress = React.useCallback(
    (event: Parameters<NonNullable<typeof pressableProps.onPress>>[0]) => {
      if (disabled) {
        return;
      }
      pressableProps.onPress?.(event);
      commitChecked(!checked);
    },
    [checked, commitChecked, disabled, pressableProps],
  );

  const handleKeyUp = React.useCallback(
    (event: Parameters<NonNullable<typeof pressableProps.onKeyUp>>[0]) => {
      pressableProps.onKeyUp?.(event);
      if (!disabled && isToggleKey((event as { nativeEvent?: { key?: string } }).nativeEvent?.key)) {
        commitChecked(!checked);
      }
    },
    [checked, commitChecked, disabled, pressableProps],
  );

  const layoutContainer = useSlot(View, { testID: 'switch-layout-container' });
  const root = useSlot(Pressable, {
    ...pressableProps,
    onPress: handlePress,
    onKeyUp: handleKeyUp,
  });
  const track = useSlot(Animated.View, trackProp);
  const thumb = useSlot(Animated.View, thumbProp);

  const beforeLabel = useOptionalSlot(Text, hasBeforeLabel ? (beforeLabelProp === undefined ? { children: label } : beforeLabelProp) : null);
  const afterLabel = useOptionalSlot(Text, hasAfterLabel ? (afterLabelProp === undefined ? { children: label } : afterLabelProp) : null);
  const aboveLabel = useOptionalSlot(Text, hasAboveLabel ? (aboveLabelProp === undefined ? { children: label } : aboveLabelProp) : null);

  return {
    ...themeState,
    ...pressableState,
    aboveLabel,
    afterLabel,
    beforeLabel,
    checked,
    checkedProgress,
    disabled,
    hasVisibleLabel,
    layout,
    layoutContainer,
    label,
    labelAfter,
    labelBefore,
    root,
    thumb,
    track,
    userStyle,
  };
}
