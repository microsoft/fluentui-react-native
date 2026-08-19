import * as React from 'react';
import { Pressable } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { usePressableState, useSlot, useToggleState } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';

import type { RadioProps, RadioState } from './radio.types';

/**
 * Resolves the Radio props into state and slot values.
 */
export function useRadio_unstable(props: RadioProps): RadioState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityState,
    defaultSelected,
    disabled = false,
    label = 'Label',
    onPress,
    onSelectedChange,
    secondaryText = 'Description',
    selected,
    showSecondaryText = false,
    style: userStyle,
    ...rest
  } = props;

  // Radio is single-select: pressing an already-selected radio keeps it selected, and the owning group deselects peers.
  const selection = useToggleState({
    value: selected,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
    mode: 'select',
    disabled,
  });

  const { activate } = selection;
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      activate();
      onPress?.(event);
    },
    [activate, onPress],
  );

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityLabel: accessibilityLabel ?? label,
    accessibilityHint: accessibilityHint ?? (showSecondaryText ? secondaryText : undefined),
    accessibilityRole: 'radio',
    accessibilityState: {
      ...accessibilityState,
      checked: selection.value,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
    onPress: handlePress,
  });
  const root = useSlot(Pressable, pressableProps);

  return {
    indicatorDotStyle: [],
    indicatorStyle: [],
    labelContainerStyle: [],
    labelStyle: [],
    root: root,
    rootStyle: [],
    disabled,
    label,
    secondaryText,
    selected: selection.value,
    showSecondaryText,
    secondaryTextStyle: [],
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
