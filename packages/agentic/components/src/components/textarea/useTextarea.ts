import { TextInput, View } from 'react-native';
import { useRootInputModality, useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useFocusTarget, useSlot } from '@fluentui-react-native/framework-base';
import { composeHandlers } from '../../common/eventHandlers';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import type { InputAccessibilityState } from '../input/input.types';
import type { TextareaProps, TextareaState } from './textarea.types';

export function useTextarea_unstable({
  accessibilityLabel,
  disabled = false,
  readOnly = false,
  error = false,
  size = 'medium',
  placeholder,
  value,
  defaultValue = '',
  onChangeText,
  style: userStyle,
  textInput,
  testID,
  ...rootProps
}: TextareaProps): TextareaState {
  const { style: editorStyle, accessibilityState, onBlur, onFocus, onSelectionChange, ...editorProps } = textInput ?? {};
  const [text = '', setText] = useControllableValue(value, defaultValue);
  const focus = useFocusTarget(!disabled);
  const modality = useRootInputModality(focus.focused && !disabled);
  const focused = focus.focused && !disabled && modality === 'keyboard';
  const { FocusRing } = useFocusVisuals({ focused, useSystemFocusRing: false, alwaysVisible: true });
  const editorState: InputAccessibilityState & { invalid?: boolean } = {
    ...accessibilityState,
    disabled,
    readOnly,
    invalid: error || undefined,
  };
  const visualState = disabled ? 'disabled' : error ? 'error' : focused ? 'focused' : readOnly ? 'readOnly' : 'rest';
  return {
    ...useThemeState(),
    ...focus,
    size,
    visualState,
    editorStyle,
    userStyle,
    FocusRing,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    textInput: useSlot(TextInput, {
      ...editorProps,
      testID: editorProps.testID ?? testID,
      accessibilityLabel: editorProps.accessibilityLabel ?? accessibilityLabel,
      accessibilityRole: 'textbox',
      accessible: true,
      accessibilityState: editorState,
      focusable: !disabled,
      pointerEvents: disabled ? 'none' : undefined,
      enableFocusRing: false,
      multiline: true,
      submitBehavior: 'newline',
      editable: !disabled && !readOnly,
      value: text,
      placeholder,
      onBlur: composeHandlers(focus.onBlur, disabled ? undefined : onBlur),
      onFocus: composeHandlers(focus.onFocus, disabled ? undefined : onFocus),
      onSelectionChange: disabled ? undefined : onSelectionChange,
      onChangeText: (next) => {
        if (disabled || readOnly) return;
        setText(next);
        onChangeText?.(next);
      },
    }),
  };
}
