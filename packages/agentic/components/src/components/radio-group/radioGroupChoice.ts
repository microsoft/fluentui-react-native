import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { resolveAccessibilityAction } from '@fluentui-react-native/framework-base';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import { isKeyboardPress } from '../../common/eventHandlers';
import type { RadioGroupOption } from './radio-group.types';
import { renderRadio_unstable } from '../radio/renderRadio';
import { useRadio_unstable } from '../radio/useRadio';
import { useRadioStyles_unstable } from '../radio/useRadioStyles';

export function RadioGroupChoice({
  option,
  selected,
  focus,
  select,
}: {
  option: RadioGroupOption;
  selected: boolean;
  focus: KeyedFocus;
  select(value: string): void;
}) {
  const { value, label, disabled, testID } = option;
  const { register, getProps, requestFocus } = focus;
  const action = resolveAccessibilityAction('select', Platform.OS, []);
  const state = useRadio_unstable({
    ...getProps(value),
    label,
    selected,
    disabled,
    testID,
    accessibilityActions: [{ name: action.name, label }],
    onAccessibilityAction: (event) => {
      if (!disabled && event.nativeEvent.actionName === action.name) select(value);
    },
    onPress: (event) => {
      if (disabled) return;
      select(value);
      if (!isKeyboardPress(event) && (Platform.OS === 'windows' || String(Platform.OS) === 'win32')) requestFocus(value, 'pointer');
    },
  });
  useLayoutEffect(() => register(value, state.focusTarget), [register, state.focusTarget, value]);
  useRadioStyles_unstable(state);
  return renderRadio_unstable(state);
}
