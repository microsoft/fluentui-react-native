import * as React from 'react';
import { View } from 'react-native';
import type { NativeSyntheticEvent, TextInput, TextInputKeyPressEventData } from 'react-native';

import { useAccessibilityLabelWarning, useControllableValue, useOptionalSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { semanticIconSources } from '../../common/iconSources';
import { Icon } from '../../primitives/icon/icon';
import { Button } from '../button/button';
import type { ButtonProps } from '../button/button.types';
import { useInput_unstable } from '../input/useInput';
import type { InputProps } from '../input/input.types';

import { getSearchBoxClearButtonStyle } from './search-box.styles';
import type { SearchBoxProps, SearchBoxState, SearchBoxVisualState } from './search-box.types';

const defaultSearchIconSource = semanticIconSources.search;
const defaultClearIconSource = semanticIconSources.dismiss;

type TextInputSlotProps = NonNullable<InputProps['textInput']>;
type TextInputObjectProps = Extract<TextInputSlotProps, { as?: unknown }>;

function isSlotObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !React.isValidElement(value);
}

function mergeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

function hasIconSource(slotProp: SearchBoxProps['icon']): boolean {
  if (!isSlotObject(slotProp)) {
    return false;
  }
  return slotProp.fontSource !== undefined || slotProp.imageSource !== undefined || slotProp.svgSource !== undefined;
}

export function useSearchBox_unstable(props: SearchBoxProps): SearchBoxState {
  const {
    'aria-labelledby': ariaLabelledBy,
    accessibilityLabelledBy,
    clearButton: clearButtonProp,
    defaultValue,
    disabled = false,
    icon: iconProp,
    onChangeText,
    onClear,
    onSearch,
    readOnly = false,
    size = 'medium',
    textInput: textInputProp,
    value: controlledValue,
    variant = 'outline',
    ...rest
  } = props;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: accessibilityLabelledBy ?? ariaLabelledBy,
    componentName: 'SearchBox',
    requireLabel: true,
    warning: 'SearchBox: provide an accessibilityLabel that names the query. A placeholder is not an accessible name.',
  });

  const [value = '', setValue] = useControllableValue(controlledValue, defaultValue ?? '');
  const textInputRef = React.useRef<TextInput | null>(null);

  const handleChangeText = React.useCallback(
    (text: string) => {
      if (disabled || readOnly) {
        return;
      }
      setValue(text);
      onChangeText?.(text);
    },
    [disabled, onChangeText, readOnly, setValue],
  );

  const handleClear = React.useCallback(() => {
    if (disabled || readOnly) {
      return;
    }
    setValue('');
    onChangeText?.('');
    onClear?.();
    textInputRef.current?.focus();
  }, [disabled, onChangeText, onClear, readOnly, setValue]);

  const handleSubmitEditing = React.useCallback(() => {
    onSearch?.(value);
  }, [onSearch, value]);

  const handleKeyPress = React.useCallback(
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = event?.nativeEvent?.key;
      if ((key === 'Escape' || key === 'Esc') && value.length > 0) {
        handleClear();
      }
    },
    [handleClear, value],
  );

  const userTextInputProps: TextInputObjectProps = isSlotObject(textInputProp) ? (textInputProp as TextInputObjectProps) : {};
  const fieldTextInputProps: TextInputObjectProps = {
    ...userTextInputProps,
    'aria-labelledby': userTextInputProps['aria-labelledby'] ?? ariaLabelledBy,
    accessibilityLabelledBy: userTextInputProps.accessibilityLabelledBy ?? accessibilityLabelledBy,
    onKeyPress: mergeHandlers(userTextInputProps.onKeyPress, handleKeyPress),
    onSubmitEditing: mergeHandlers(userTextInputProps.onSubmitEditing, handleSubmitEditing),
    role: userTextInputProps.role ?? 'searchbox',
  };

  // The field owns every chrome, size, typography, and visual-state binding. SearchBox forwards the
  // resolved query and never redefines them.
  const field = useInput_unstable({
    ...rest,
    disabled,
    onChangeText: handleChangeText,
    readOnly,
    size,
    textInput: fieldTextInputProps,
    value,
    variant,
  });

  const clearVisible = value.length > 0 && clearButtonProp !== null;
  const clearButtonStyle = getSearchBoxClearButtonStyle(field, size);

  const icon = useOptionalSlot(Icon, iconProp, {
    defaultProps: hasIconSource(iconProp)
      ? { accessible: false, testID: 'search-box-icon' }
      : { accessible: false, fontSource: defaultSearchIconSource, testID: 'search-box-icon' },
    renderByDefault: true,
  });
  const clearButtonGroup = useOptionalSlot(View, clearVisible ? {} : null);
  const clearButton = useOptionalSlot(Button, clearVisible ? ((clearButtonProp ?? undefined) as SlotProp<typeof Button>) : null, {
    defaultProps: {
      accessibilityLabel: 'Clear search',
      appearance: 'secondary',
      icon: { fontSource: defaultClearIconSource },
      shape: 'circle',
      size: 'small',
      style: clearButtonStyle,
      testID: 'search-box-clear-button',
    },
    renderByDefault: true,
    transform: (slotProps: ButtonProps) => ({
      ...slotProps,
      disabled: disabled || readOnly,
      onPress: handleClear,
    }),
  });

  return {
    clearButton,
    clearButtonGroup,
    clearButtonGroupStyle: field.iconEndStyle,
    clearButtonStyle,
    clearVisible,
    contents: field.contents,
    disabled,
    field,
    focused: field.focused,
    hovered: field.hovered,
    icon,
    iconTextStack: field.iconTextStack,
    pressed: field.pressed,
    readOnly,
    root: field.root,
    size,
    textInput: field.textInput,
    textInputRef,
    underline: field.underline,
    userStyle: field.userStyle,
    value,
    variant,
    // The field never resolves the error state because SearchBox never passes `error`.
    visualState: field.visualState as SearchBoxVisualState,
  };
}
