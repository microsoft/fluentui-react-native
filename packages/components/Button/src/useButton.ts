import * as React from 'react';
import { Platform } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

import type { ButtonProps, ButtonInfo } from './Button.types';

// On win32 we don't want to fire the onClick event if the Button
// hasn't received a key down event first. This prevents behavior
// like the button firing after you tab to it white Enter is pressed
// and then releasing Enter, or the Menu reopening since it closes
// onKeyDown while the Button operates onKeyUp.
const shouldOnlyFireIfPressed = Platform.OS === ('win32' as any);

export const useButton = (props: ButtonProps): ButtonInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible,
    accessibilityRole,
    componentRef = defaultComponentRef,
    disabled,
    onBlur,
    onClick,
    loading,
    enableFocusRing,
    focusable,
    ...rest
  } = props;

  const isDisabled = !!disabled || !!loading;
  const [isProcessingKeyboardInvocation, setIsProcessingKeyboardInvocation] = React.useState<boolean>(false);

  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const onBlurInner = React.useCallback(
    (e) => {
      setIsProcessingKeyboardInvocation(false);
      onBlur?.(e);
    },
    [onBlur],
  );
  const pressable = usePressableState({ ...rest, onPress: onClickWithFocus, onBlur: shouldOnlyFireIfPressed ? onBlurInner : onBlur });

  const onKeyDown = React.useCallback(
    (e) => {
      if (!disabled && (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ' ')) {
        setIsProcessingKeyboardInvocation(true);
      }
    },
    [disabled],
  );
  const onKeyPress = React.useCallback(
    (e) => {
      if (isProcessingKeyboardInvocation) {
        onClick?.(e);
        setIsProcessingKeyboardInvocation(false);
      }
    },
    [isProcessingKeyboardInvocation, onClick],
  );
  const onKeyProps = useKeyProps(shouldOnlyFireIfPressed ? onKeyPress : onClick, ' ', 'Enter');

  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  const theme = useFluentTheme();
  const shouldUseTwoToneFocusBorder = Platform.OS === ('win32' as any) && props.appearance === 'primary' && !isHighContrast(theme);
  const [baseHeight, setBaseHeight] = React.useState<number | undefined>(undefined);
  const [baseWidth, setBaseWidth] = React.useState<number | undefined>(undefined);
  const onLayout = React.useCallback(
    (e: LayoutEvent) => {
      // Only run when shouldUseTwoToneFocusBorder so that state update doesn't
      // affect platforms that don't need it.
      if (shouldUseTwoToneFocusBorder) {
        setBaseHeight(e.nativeEvent.layout.height);
        setBaseWidth(e.nativeEvent.layout.width);
      }
    },
    [setBaseHeight, setBaseWidth, shouldUseTwoToneFocusBorder],
  );

  return {
    props: {
      ...onKeyProps,
      ...(Platform.OS === ('win32' as any) && { onKeyDown: onKeyDown }),
      ...pressable.props, // allow user key events to override those set by us
      /**
       * https://github.com/facebook/react-native/issues/34986
       * Due to a bug in React Native, unconditionally passing this may cause unnecessary re-renders.
       * Therefore, let's only pass it in if it's defined to limit this issue.
       */
      ...(isDisabled && { disabled: isDisabled }),
      accessible: accessible ?? true,
      accessibilityRole: accessibilityRole || 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      enableFocusRing: enableFocusRing ?? !shouldUseTwoToneFocusBorder,
      focusable: focusable ?? !isDisabled,
      ref: useViewCommandFocus(componentRef),
      iconPosition: props.iconPosition || 'before',
      loading,
      onLayout,
    },
    state: {
      ...pressable.state,
      pressed: pressable.state.pressed || isProcessingKeyboardInvocation,
      measuredWidth: baseWidth,
      measuredHeight: baseHeight,
      shouldUseTwoToneFocusBorder: shouldUseTwoToneFocusBorder,
    },
  };
};
