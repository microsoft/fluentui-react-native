import * as React from 'react';
import { Platform } from 'react-native';
import type { PressableProps } from 'react-native';

import { isSelfTargetEvent } from './focusTarget';
import { requestsFocusOnPointerPress } from './pointerFocus';
import { useFocusTarget } from './useFocusTarget';
import type { FocusTargetBinding } from './useFocusTarget';
import { usePressableState } from './usePressableState';
import type { PressableState } from '../types/interactive.types';
import type { FocusablePressableOptions, FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable.types';

export type { FocusablePressableOptions, FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable.types';

const interactionKeys = ['pressed', 'hovered'] as const;
type PressEvent = Parameters<NonNullable<PressableProps['onPressIn']>>[0];

function activationKey(event: FocusKeyboardEvent): string | undefined {
  const { key, code } = event.nativeEvent;
  if (code === 'Enter' || key === 'Enter') {
    return 'Enter';
  }
  if (code === 'Space' || key === ' ' || key === 'Space' || key === 'Spacebar') {
    return 'Space';
  }
  if (code === 'GamepadA') {
    return 'GamepadA';
  }
  return undefined;
}

function hasNativeActivationCode(event: FocusKeyboardEvent): boolean {
  return ['Enter', 'Space', 'GamepadA'].includes(event.nativeEvent.code ?? '');
}

/**
 * Coordinates native Pressability and the paired Win32 keyboard fallback.
 * The returned internal ref must be composed onto the actual pressable slot.
 */
export function useFocusablePressable(
  props: FocusablePressableProps,
  { pointerFocus = 'platform', disabledFocusable = false }: FocusablePressableOptions = {},
): [FocusablePressableProps, PressableState, FocusTargetBinding] {
  const platform: string = Platform.OS;
  const focusOnPointerPress = requestsFocusOnPointerPress(platform, pointerFocus);
  const { disabled = false, focusable = true, onFocus, onBlur, onPress, onKeyDown, onKeyUp } = props;
  const focusEligible = (!disabled || disabledFocusable) && focusable;
  const target = useFocusTarget(focusEligible);
  const { focusTarget, focusTargetRef } = target;
  const keyDown = React.useRef<string | undefined>(undefined);
  const keyGeneration = React.useRef<number | undefined>(undefined);
  const pressActive = React.useRef(false);
  const keyboardPress = React.useRef<{ event: PressEvent; key: string; generation: number } | undefined>(undefined);
  const [interactionProps, interactionState] = usePressableState(props, interactionKeys);
  const { onPressOut: releasePress } = interactionProps;
  const finishKeyboardPress = React.useCallback(
    (event?: PressEvent) => {
      const press = keyboardPress.current;
      if (press) {
        keyboardPress.current = undefined;
        pressActive.current = false;
        releasePress?.(event ?? press.event);
      }
    },
    [releasePress],
  );
  const generation = focusTarget.generation;

  React.useLayoutEffect(() => {
    if (disabled || !focusable || (keyboardPress.current && keyboardPress.current.generation !== generation)) {
      keyDown.current = undefined;
      keyGeneration.current = undefined;
      finishKeyboardPress();
    }
  }, [disabled, focusable, generation, finishKeyboardPress]);

  const handlePress = (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    // Pressability has already chosen the responder. Pointer targets may be
    // noninteractive text/icon descendants of this pressable.
    if (disabled) {
      return;
    }
    const native = event.nativeEvent;
    const keyboard = native != null && ('key' in native || 'code' in native);
    if (focusOnPointerPress && focusable && !keyboard) {
      const request = focusTarget.requestFocus('pointer');
      if (request.status !== 'requested' && request.status !== 'confirmed') {
        console.warn(`Cannot focus the pressable target: ${request.status}.`);
      }
    }
    onPress?.(event);
  };
  const handlePressIn = (event: PressEvent) => {
    if (disabled) return;
    pressActive.current = true;
    const key = event?.nativeEvent ? activationKey(event) : undefined;
    if (key) {
      event.persist?.();
      keyboardPress.current = { event, key, generation: focusTarget.generation };
    }
    interactionProps.onPressIn?.(event);
  };
  const focusProps = {
    onPressIn: handlePressIn,
    onPressOut: (event: PressEvent) => {
      // Native release can arrive after blur/disable has already ended the keyboard press.
      if (!pressActive.current) return;
      pressActive.current = false;
      keyboardPress.current = undefined;
      interactionProps.onPressOut?.(event);
    },
    onFocus: (event: Parameters<NonNullable<PressableProps['onFocus']>>[0]) => {
      target.onFocus(event);
      onFocus?.(event);
    },
    onBlur: (event: Parameters<NonNullable<PressableProps['onBlur']>>[0]) => {
      if (isSelfTargetEvent(event)) {
        keyDown.current = undefined;
        keyGeneration.current = undefined;
        finishKeyboardPress();
      }
      target.onBlur(event);
      onBlur?.(event);
    },
    onKeyDown: (event: FocusKeyboardEvent) => {
      onKeyDown?.(event);
      const key = activationKey(event);
      const native = event.nativeEvent;
      const modifiers = native.altKey || native.metaKey || (platform !== 'win32' && (native.ctrlKey || native.shiftKey));
      if (key) {
        if (
          disabled ||
          !focusable ||
          !focusTarget.current ||
          modifiers ||
          !isSelfTargetEvent(event) ||
          (keyDown.current === key && keyGeneration.current === focusTarget.generation) ||
          (keyboardPress.current?.key === key && keyboardPress.current.generation === focusTarget.generation)
        ) {
          event.preventDefault?.();
          return;
        }
        if (!event.defaultPrevented && keyboardPress.current) {
          finishKeyboardPress();
        }
        keyDown.current = event.defaultPrevented ? undefined : key;
        keyGeneration.current = focusTarget.generation;
        event.stopPropagation?.();
        if (platform === 'win32' && !event.defaultPrevented && !hasNativeActivationCode(event)) {
          // Win32 Pressability forwards native key events through its press
          // callbacks, despite their touch-event declaration. Preserve that
          // event identity and lifecycle when its code-based path cannot start.
          handlePressIn(event as PressEvent);
        }
      } else {
        keyDown.current = undefined;
        keyGeneration.current = undefined;
        if (platform !== 'macos') {
          finishKeyboardPress();
        }
      }
    },
    onKeyUp: (event: FocusKeyboardEvent) => {
      onKeyUp?.(event);
      const key = activationKey(event);
      const paired = keyDown.current === key && keyGeneration.current === focusTarget.generation;
      keyDown.current = undefined;
      keyGeneration.current = undefined;
      if (key) {
        if (platform === 'macos') {
          // macOS already activated on keydown; its release only ends pressed
          // feedback, even when another key cancelled the activation pairing.
          if (
            isSelfTargetEvent(event) &&
            focusTarget.current &&
            keyboardPress.current?.key === key &&
            keyboardPress.current.generation === focusTarget.generation
          ) {
            event.stopPropagation?.();
            if (event.defaultPrevented) {
              finishKeyboardPress();
            }
          } else {
            event.preventDefault?.();
          }
          return;
        }
        if (disabled || !focusable || !focusTarget.current || !isSelfTargetEvent(event) || !paired) {
          event.preventDefault?.();
          if (keyboardPress.current?.key === key) {
            finishKeyboardPress();
          }
          return;
        }
        event.stopPropagation?.();
        if (event.defaultPrevented) {
          finishKeyboardPress();
        }
        const fallbackStarted = keyboardPress.current && !hasNativeActivationCode(keyboardPress.current.event);
        if (platform === 'win32' && !event.defaultPrevented && (fallbackStarted || !hasNativeActivationCode(event))) {
          // Office Win32 can report code="Unidentified". Its Pressability only
          // recognizes code, unlike V1's key-based activation. Keep one paired
          // fallback, passing the native key event just as Pressability does.
          event.preventDefault?.();
          const pressEvent = event as PressEvent;
          finishKeyboardPress(pressEvent);
          handlePress(pressEvent);
        }
      }
    },
    onPress: handlePress,
    onLongPress:
      props.onLongPress &&
      ((event: PressEvent) => {
        if (!disabled) props.onLongPress?.(event);
      }),
    onAccessibilityTap: props.onAccessibilityTap && (disabled ? () => undefined : props.onAccessibilityTap),
  };

  return [
    {
      ...interactionProps,
      ...focusProps,
      // macOS Pressable otherwise removes focusability and overwrites the disabled accessibility state.
      disabled: disabled && disabledFocusable && platform === 'macos' ? undefined : props.disabled,
      ...(disabled &&
        disabledFocusable && {
          'aria-disabled': true,
          accessibilityState: { ...props.accessibilityState, disabled: true },
        }),
      focusable: focusEligible,
    },
    { ...interactionState, ...(disabled && { pressed: false, hovered: false }), focused: target.focused },
    { focusTarget, focusTargetRef },
  ];
}
