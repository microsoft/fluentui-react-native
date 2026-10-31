import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { useRootInputModality, useThemeState } from '@fluentui-react-native/design';
import { useControllableValue, useFocusTarget, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';

import { composeHandlers } from '../../common/eventHandlers';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';

import { getInputResolvedStyles, getInputVisualState } from './input.styles';
import type { InputAccessibilityState, InputProps, InputState } from './input.types';

type InteractiveTextInputProps = TextInputProps & {
  onHoverIn?: (...args: any[]) => void;
  onHoverOut?: (...args: any[]) => void;
  onPressIn?: (...args: any[]) => void;
  onPressOut?: (...args: any[]) => void;
};

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
  const slotFocusable =
    textInputProp !== null && typeof textInputProp === 'object' && 'focusable' in textInputProp ? textInputProp.focusable : undefined;
  const resolvedFocusable = !disabled && (slotFocusable ?? focusable ?? true);
  const focus = useFocusTarget(resolvedFocusable);
  const { focused, focusTarget } = focus;
  const modality = useRootInputModality(focused && !disabled);
  const focusVisible = focused && !disabled && modality === 'keyboard';
  const { FocusRing } = useFocusVisuals({ focused: focusVisible, useSystemFocusRing: false, alwaysVisible: true });
  const blurFocusTarget = focus.onBlur;
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const focusTextInput = React.useCallback(() => {
    focusTarget.requestFocus('pointer');
  }, [focusTarget]);

  React.useEffect(() => {
    if (disabled) {
      setHovered(false);
      setPressed(false);
    }
  }, [disabled]);

  React.useEffect(() => {
    if (__DEV__ && iconEnd2Prop && !iconEnd1Prop) {
      console.warn('Input: iconEnd2 requires iconEnd1 to be provided.');
    }
  }, [iconEnd1Prop, iconEnd2Prop]);

  const visualState = getInputVisualState({ disabled, error, focused, hovered, pressed, readOnly });
  const resolvedStyles = getInputResolvedStyles({ ...themeState, size, variant, visualState, focusVisible });

  const handleChangeText = React.useCallback(
    (text: string) => {
      if (disabled || readOnly) {
        return;
      }
      setCurrentValue(text);
    },
    [disabled, readOnly, setCurrentValue],
  );

  const handleBlur = React.useCallback(
    (event: Parameters<typeof focus.onBlur>[0]) => {
      blurFocusTarget(event);
      setPressed(false);
    },
    [blurFocusTarget],
  );
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
  const contents = useSlot(Pressable, {
    accessibilityRole: 'none',
    accessible: false,
    disabled,
    focusable: false,
    onPress: focusTextInput,
  });
  const iconTextStack = useSlot(View, {});
  const iconEnd = useOptionalSlot(View, iconEnd1Prop || iconEnd2Prop ? {} : null);
  const underline = useOptionalSlot(View, variant === 'underline' ? {} : null);
  const underlineFocus = useOptionalSlot(View, variant === 'underline' ? {} : null);
  const iconStart = useOptionalSlot(Icon, iconStartProp);
  const iconEnd1 = useOptionalSlot(Icon, iconEnd1Prop);
  const iconEnd2 = useOptionalSlot(Icon, iconEnd2Prop);
  const textInput = useSlot(TextInput, textInputProp, {
    transform: (slotProps: InteractiveTextInputProps) => ({
      ...slotProps,
      accessibilityHint: slotProps.accessibilityHint ?? accessibilityHint,
      accessibilityLabel: slotProps.accessibilityLabel ?? accessibilityLabel,
      accessibilityRole: slotProps.accessibilityRole ?? 'textbox',
      accessibilityState: {
        ...slotProps.accessibilityState,
        ...accessibilityState,
        disabled,
        invalid: error || undefined,
        readOnly,
      } as InputAccessibilityState,
      accessible: slotProps.accessible ?? accessible ?? true,
      editable: disabled || readOnly ? false : (slotProps.editable ?? true),
      focusable: resolvedFocusable,
      enableFocusRing: false,
      ref: focus.focusTargetRef,
      onBlur: composeHandlers(slotProps.onBlur, onBlur, handleBlur),
      onChangeText: composeHandlers(slotProps.onChangeText, onChangeText, handleChangeText),
      onFocus: composeHandlers(slotProps.onFocus, onFocus, focus.onFocus),
      onHoverIn: composeHandlers(slotProps.onHoverIn, onHoverIn, handleHoverIn),
      onHoverOut: composeHandlers(slotProps.onHoverOut, onHoverOut, handleHoverOut),
      onPressIn: composeHandlers(slotProps.onPressIn, onPressIn, handlePressIn),
      onPressOut: composeHandlers(slotProps.onPressOut, onPressOut, handlePressOut),
      placeholder: placeholder ?? slotProps.placeholder,
      placeholderTextColor: resolvedStyles.placeholderTextColor,
      style: [resolvedStyles.textInput, slotProps.style],
      testID: slotProps.testID ?? testID,
      value: currentValue,
    }),
  });

  return {
    ...themeState,
    FocusRing: variant === 'outline' ? FocusRing : undefined,
    focusTarget: focus.focusTarget,
    focusTargetRef: focus.focusTargetRef,
    contents,
    contentsStyle: resolvedStyles.contents,
    disabled,
    error,
    focused,
    focusVisible,
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
    underlineFocus,
    underlineFocusStyle: resolvedStyles.underlineFocus,
    userStyle,
    value: currentValue,
    variant,
    visualState,
  };
}
