import * as React from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';

import {
  resolveAccessibilityAction,
  useAccessibilityLabelWarning,
  useFocusablePressable,
  useOptionalSlot,
  useReducedMotion,
  useSlot,
  useToggleState,
} from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { useFocusVisuals } from '../../common/useFocusVisuals';

import { Text } from '../text/text';
import type { SwitchProps, SwitchState } from './switch.types';

/**
 * Resolve the Switch component state, slots, accessibility, and interactive behavior.
 */
export function useSwitch_unstable(props: SwitchProps): SwitchState {
  const {
    aboveLabel: aboveLabelProp,
    accessibilityActions,
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
    onAccessibilityAction,
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
  const explicitAccessibleName =
    accessibilityLabel !== undefined ||
    accessibilityLabelledBy !== undefined ||
    rest['aria-label'] !== undefined ||
    rest['aria-labelledby'] !== undefined;

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

  const { toggle: toggleChecked } = toggle;
  const toggleAction = React.useMemo(() => resolveAccessibilityAction('toggle', Platform.OS, accessibilityActions), [accessibilityActions]);
  const handleAccessibilityAction = React.useCallback<NonNullable<SwitchProps['onAccessibilityAction']>>(
    (event) => {
      if (event.nativeEvent.actionName === toggleAction.name) {
        toggleChecked();
      }
      onAccessibilityAction?.(event);
    },
    [onAccessibilityAction, toggleChecked, toggleAction.name],
  );
  const handlePress = React.useCallback(
    (event: Parameters<NonNullable<SwitchProps['onPress']>>[0]) => {
      toggleChecked();
      onPress?.(event);
    },
    [onPress, toggleChecked],
  );

  const [pressableProps, pressableState, focusBinding] = useFocusablePressable({
    ...rest,
    ...pressableNameProps,
    accessibilityRole: 'switch',
    accessibilityActions: toggleAction.accessibilityActions,
    onAccessibilityAction: handleAccessibilityAction,
    accessibilityState: {
      ...rest.accessibilityState,
      checked,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: !disabled && (rest.focusable ?? true),
    'aria-checked': checked,
    onPress: handlePress,
  });

  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !disabled });

  const layoutContainer = useSlot(View, { testID: 'switch-layout-container' });
  const root = useSlot(Pressable, {
    ...pressableProps,
    ...nativeFocusProps,
    ref: rootRef,
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
    FocusRing,
    ...themeState,
    ...pressableState,
    ...focusBinding,
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
