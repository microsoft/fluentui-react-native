import * as React from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import {
  useAccessibilityLabelWarning,
  usePressableState,
  useOptionalSlot,
  useReducedMotion,
  useSlot,
  useToggleState,
} from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import { hasAccessibleName } from '../../common/accessibility';
import { resolveFocusable } from '../../common/interaction';
import { Text } from '../text/text';
import type { SwitchProps, SwitchState } from './switch.types';

const TOGGLE_KEYS = new Set(['Enter', ' ', 'Spacebar', 'Space']);

function isToggleKey(key: string | undefined): boolean {
  return key !== undefined && TOGGLE_KEYS.has(key);
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
    defaultChecked,
    disabled = false,
    label = 'Label',
    labelAfter = true,
    labelBefore = true,
    layout = 'horizontal',
    onChange,
    onPress,
    ref: rootRef,
    thumb: thumbProp,
    style: userStyle,
    track: trackProp,
    ...rest
  } = props;

  const toggle = useToggleState({ value: checkedProp, defaultValue: defaultChecked, onChange, disabled });
  const checked = toggle.value;
  const hasBeforeLabel = layout === 'horizontal' && labelBefore && beforeLabelProp !== null;
  const hasAfterLabel = layout === 'horizontal' && labelAfter && afterLabelProp !== null;
  const hasAboveLabel = layout === 'vertical' && aboveLabelProp !== null;
  const hasVisibleLabel = hasBeforeLabel || hasAfterLabel || hasAboveLabel;
  const themeState = useThemeState();
  const reduceMotion = useReducedMotion() ?? false;
  const checkedProgress = React.useRef(new Animated.Value(checked ? 1 : 0)).current;
  const hasMounted = React.useRef(false);
  const explicitAccessibleName = hasAccessibleName({
    accessibilityLabel,
    accessibilityLabelledBy,
    ...rest,
  });

  useAccessibilityLabelWarning({
    accessibilityLabel: accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Switch',
    requireLabel: !hasVisibleLabel && (!label || label === 'Label'),
    warning: 'Switch: standalone switches require an accessibilityLabel when no visible labels are rendered.',
  });

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
        };

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    ...pressableNameProps,
    role: 'switch',
    accessibilityState: {
      ...rest.accessibilityState,
      checked,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: resolveFocusable(rest.focusable, disabled),
    'aria-checked': checked,
  });

  const { toggle: toggleChecked } = toggle;
  const handlePress = React.useCallback(
    (event: Parameters<NonNullable<typeof pressableProps.onPress>>[0]) => {
      toggleChecked();
      onPress?.(event);
    },
    [onPress, toggleChecked],
  );

  const handleKeyUp = React.useCallback(
    (event: Parameters<NonNullable<typeof pressableProps.onKeyUp>>[0]) => {
      pressableProps.onKeyUp?.(event);
      if (isToggleKey((event as { nativeEvent?: { key?: string } }).nativeEvent?.key)) {
        toggleChecked();
      }
    },
    [pressableProps, toggleChecked],
  );

  const layoutContainer = useSlot(View, { testID: 'switch-layout-container' });
  const root = useSlot(Pressable, {
    ...pressableProps,
    ref: rootRef,
    onPress: handlePress,
    onKeyUp: handleKeyUp,
  });
  const track = useSlot(Animated.View, trackProp);
  const thumb = useSlot(Animated.View, thumbProp);

  const beforeLabel = useOptionalSlot(
    Text,
    hasBeforeLabel ? (beforeLabelProp === undefined ? { children: label } : beforeLabelProp) : null,
  );
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
