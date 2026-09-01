import * as React from 'react';
import { Pressable, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useControllableValue, useFocusVisible, usePressableState, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import type { CheckboxProps, CheckboxState, CheckboxStatus } from './checkbox.types';

type NativeFocusPressableProps = React.ComponentProps<typeof Pressable> & {
  enableFocusRing: boolean;
};

function getNextStatus(status: CheckboxStatus): CheckboxStatus {
  return status === 'checked' ? 'unchecked' : 'checked';
}

export function useCheckbox_unstable(props: CheckboxProps): CheckboxState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityState,
    defaultStatus = 'unchecked',
    disabled = false,
    label = 'Label',
    onPress,
    onStatusChange,
    ref: rootRef,
    secondaryText = 'Description',
    showLabel = true,
    showSecondaryText = false,
    status: statusProp,
    style: userStyle,
    variant = 'standard',
    ...rest
  } = props;

  const [statusValue, setStatus] = useControllableValue(statusProp, defaultStatus, (nextStatus) => {
    if (nextStatus !== undefined) {
      onStatusChange?.(nextStatus);
    }
  });
  const status = statusValue ?? defaultStatus;
  const renderSecondaryText = showLabel && showSecondaryText;
  const themeState = useThemeState();

  React.useEffect(() => {
    if (__DEV__ && showSecondaryText && !showLabel) {
      console.warn('Checkbox: secondary text requires a visible label.');
    }
  }, [showLabel, showSecondaryText]);

  const handlePress = React.useCallback(
    (event: Parameters<NonNullable<CheckboxProps['onPress']>>[0]) => {
      if (disabled) {
        return;
      }
      setStatus(getNextStatus(status));
      onPress?.(event);
    },
    [disabled, onPress, setStatus, status],
  );

  const rootAccessibilityLabel = accessibilityLabel ?? label;
  const rootAccessibilityHint = renderSecondaryText ? [accessibilityHint, secondaryText].filter(Boolean).join('. ') : accessibilityHint;

  const nativeProps: NativeFocusPressableProps = {
    ...rest,
    accessibilityHint: rootAccessibilityHint,
    accessibilityLabel: rootAccessibilityLabel,
    accessibilityRole: 'checkbox',
    accessibilityState: {
      ...accessibilityState,
      checked: status === 'indeterminate' ? 'mixed' : status === 'checked',
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    enableFocusRing: false,
    focusable: rest.focusable ?? !disabled,
    onPress: handlePress,
  };
  const [focusVisibleProps, focusVisible] = useFocusVisible(nativeProps);
  const [pressableProps, pressableState] = usePressableState(focusVisibleProps);

  const root = useSlot(Pressable, { ...pressableProps, ref: rootRef });
  const labelText = useOptionalSlot(Text, showLabel ? { accessible: false, children: label, testID: 'checkbox-label' } : null);
  const secondaryTextSlot = useOptionalSlot(
    Text,
    renderSecondaryText
      ? { accessibilityElementsHidden: true, accessible: false, children: secondaryText, testID: 'checkbox-secondary' }
      : null,
  );

  return {
    ...themeState,
    ...pressableState,
    disabled,
    focusVisible,
    label,
    labelText,
    renderSecondaryText,
    root,
    secondaryText,
    secondaryTextSlot,
    showLabel,
    showSecondaryText,
    status,
    userStyle,
    variant,
    indicatorIconColor: undefined,
    indicatorIconSize: 12,
    indicatorStyle: [] as StyleProp<ViewStyle>,
    labelContainerStyle: [] as StyleProp<ViewStyle>,
  };
}
