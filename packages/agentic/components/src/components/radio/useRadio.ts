import { Pressable } from 'react-native';

import { usePressableState, useSlot } from '@fluentui-react-native/framework-base';
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
    disabled = false,
    label = 'Label',
    ref: rootRef,
    secondaryText = 'Description',
    selected = false,
    showSecondaryText = false,
    style: userStyle,
    ...rest
  } = props;

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityLabel: accessibilityLabel ?? label,
    accessibilityHint: accessibilityHint ?? (showSecondaryText ? secondaryText : undefined),
    accessibilityRole: 'radio',
    accessibilityState: {
      ...accessibilityState,
      checked: selected,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
  });
  const root = useSlot(Pressable, { ...pressableProps, ref: rootRef });

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
    selected,
    showSecondaryText,
    secondaryTextStyle: [],
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
