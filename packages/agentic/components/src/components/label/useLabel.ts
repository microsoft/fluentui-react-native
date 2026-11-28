import { useLayoutEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { Text } from '../text/text';
import type { LabelProps, LabelState } from './label.types';

export function useLabel_unstable({
  content,
  labelID,
  target,
  size = 'medium',
  weight = 'regular',
  required = false,
  disabled = false,
  style: userStyle,
  ...rootProps
}: LabelProps): LabelState {
  const armed = useRef<(() => void) | undefined>(undefined);
  const invoke = disabled ? undefined : target?.kind === 'editor' ? target.focus : target?.kind === 'choice' ? target.activate : undefined;
  useLayoutEffect(() => {
    if (armed.current !== invoke) armed.current = undefined;
  }, [invoke]);
  return {
    ...useThemeState(),
    size,
    weight,
    muted: disabled,
    userStyle,
    hasText: !!content.trim(),
    root: useSlot(View, { ...rootProps, accessible: true, accessibilityRole: 'text', accessibilityLabel: content, focusable: false }),
    row: useSlot(Pressable, {
      accessible: false,
      focusable: false,
      disabled: !invoke,
      onPressIn: invoke
        ? () => {
            armed.current = invoke;
          }
        : undefined,
      onPress: invoke
        ? () => {
            const pressed = armed.current;
            armed.current = undefined;
            if (pressed === invoke) invoke();
          }
        : undefined,
    }),
    text: useSlot(Text, { ...hiddenFromAccessibilityProps, nativeID: labelID, children: content }),
    requiredMark: useOptionalSlot(Text, required ? { ...hiddenFromAccessibilityProps, children: '*' } : null),
  };
}
