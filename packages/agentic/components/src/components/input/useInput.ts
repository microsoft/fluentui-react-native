import * as React from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useDevWarning, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { resolveFocusable } from '../../common/interaction';
import { Icon } from '../../primitives/icon/icon';

import { getInputResolvedStyles } from './input.styles';
import type { InputAccessibilityState, InputProps, InputState, InputVisualState } from './input.types';

type InteractiveTextInputProps = TextInputProps & {
  onHoverIn?: (...args: any[]) => void;
  onHoverOut?: (...args: any[]) => void;
  onPressIn?: (...args: any[]) => void;
  onPressOut?: (...args: any[]) => void;
};

function mergeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

function getVisualState(
  props: Pick<InputState, 'disabled' | 'error' | 'readOnly'> & { focused: boolean; hovered: boolean; pressed: boolean },
): InputVisualState {
  if (props.disabled) {
    return 'disabled';
  }
  if (props.error) {
    return 'error';
  }
  if (props.readOnly) {
    return 'readOnly';
  }
  if (props.focused) {
    return 'focused';
  }
  if (props.pressed) {
    return 'pressed';
  }
  if (props.hovered) {
    return 'hovered';
  }
  return 'rest';
}

export function useInput_unstable(props: InputProps): InputState {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessibilityState,
    accessible,
    defaultValue,
    disabled = false,
    error = false,
    focusable,
    iconEnd1: iconEnd1Prop,
    iconEnd2: iconEnd2Prop,
    iconStart: iconStartProp,
    onBlur,
    onChangeText,
    onFocus,
    onHoverIn,
    onHoverOut,
    onPressIn,
    onPressOut,
    placeholder,
    readOnly = false,
    size = 'medium',
    style: userStyle,
    testID,
    textInput: textInputProp,
    value: controlledValue,
    variant = 'outline',
    ...rootProps
  } = props;
  const themeState = useThemeState();
  const [currentValue = '', setCurrentValue] = useControllableValue(controlledValue, defaultValue ?? '');
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  React.useEffect(() => {
    if (disabled) {
      setFocused(false);
      setHovered(false);
      setPressed(false);
    }
  }, [disabled]);

  useDevWarning(Boolean(iconEnd2Prop && !iconEnd1Prop), 'Input: iconEnd2 requires iconEnd1 to be provided.');

  const visualState = getVisualState({ disabled, error, focused, hovered, pressed, readOnly });
  const resolvedStyles = getInputResolvedStyles({ ...themeState, size, variant, visualState });

  const handleChangeText = React.useCallback(
    (text: string) => {
      if (disabled || readOnly) {
        return;
      }
      setCurrentValue(text);
    },
    [disabled, readOnly, setCurrentValue],
  );

  const handleFocus = React.useCallback(() => {
    if (!disabled) {
      setFocused(true);
    }
  }, [disabled]);
  const handleBlur = React.useCallback(() => {
    setFocused(false);
    setPressed(false);
  }, []);
  const handleHoverIn = React.useCallback(() => {
    if (!disabled) {
      setHovered(true);
    }
  }, [disabled]);
  const handleHoverOut = React.useCallback(() => {
    setHovered(false);
  }, []);
  const handlePressIn = React.useCallback(() => {
    if (!disabled) {
      setPressed(true);
    }
  }, [disabled]);
  const handlePressOut = React.useCallback(() => {
    setPressed(false);
  }, []);

  const root = useSlot(View, rootProps);
  const contents = useSlot(View, {});
  const iconTextStack = useSlot(View, {});
  const iconEnd = useOptionalSlot(View, iconEnd1Prop || iconEnd2Prop ? {} : null);
  const underline = useOptionalSlot(View, variant === 'underline' ? {} : null);
  const iconStart = useOptionalSlot(Icon, iconStartProp);
  const iconEnd1 = useOptionalSlot(Icon, iconEnd1Prop);
  const iconEnd2 = useOptionalSlot(Icon, iconEnd2Prop);
  const textInput = useSlot(TextInput, textInputProp, {
    transform: (slotProps: InteractiveTextInputProps) => ({
      ...slotProps,
      accessibilityHint: slotProps.accessibilityHint ?? accessibilityHint,
      accessibilityLabel: slotProps.accessibilityLabel ?? accessibilityLabel,
      accessibilityState: {
        ...slotProps.accessibilityState,
        ...accessibilityState,
        disabled,
        invalid: error || undefined,
        readOnly,
      } as InputAccessibilityState,
      accessible: slotProps.accessible ?? accessible ?? true,
      editable: disabled || readOnly ? false : (slotProps.editable ?? true),
      focusable: resolveFocusable(slotProps.focusable ?? focusable, disabled),
      onBlur: mergeHandlers(slotProps.onBlur, onBlur, handleBlur),
      onChangeText: mergeHandlers(slotProps.onChangeText, onChangeText, handleChangeText),
      onFocus: mergeHandlers(slotProps.onFocus, onFocus, handleFocus),
      onHoverIn: mergeHandlers(slotProps.onHoverIn, onHoverIn, handleHoverIn),
      onHoverOut: mergeHandlers(slotProps.onHoverOut, onHoverOut, handleHoverOut),
      onPressIn: mergeHandlers(slotProps.onPressIn, onPressIn, handlePressIn),
      onPressOut: mergeHandlers(slotProps.onPressOut, onPressOut, handlePressOut),
      placeholder: placeholder ?? slotProps.placeholder,
      placeholderTextColor: resolvedStyles.placeholderTextColor,
      style: [resolvedStyles.textInput, slotProps.style],
      testID: slotProps.testID ?? testID,
      value: currentValue,
    }),
  });

  return {
    ...themeState,
    contents,
    contentsStyle: resolvedStyles.contents,
    disabled,
    error,
    focused,
    hovered,
    iconColor: resolvedStyles.iconColor,
    iconEnd,
    iconEnd1,
    iconEnd2,
    iconEndStyle: resolvedStyles.iconEnd,
    iconSize: resolvedStyles.iconSize,
    iconStart,
    iconTextStack,
    iconTextStackStyle: resolvedStyles.iconTextStack,
    pressed,
    readOnly,
    root,
    rootStyle: resolvedStyles.root,
    size,
    textInput,
    textInputStyle: resolvedStyles.textInput,
    underline,
    underlineStyle: resolvedStyles.underline,
    userStyle,
    value: currentValue,
    variant,
    visualState,
  };
}
