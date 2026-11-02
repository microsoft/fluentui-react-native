import * as React from 'react';
import { Platform } from 'react-native';

import { memoize } from '@fluentui-react-native/framework-base';

import type { KeyCallback, KeyPressEvent, KeyPressProps } from './useKeyProps.types';

const shouldAllowShiftCtrlKeys = Platform.OS === ('win32' as any);

/**
 * Verifies if nativeEvent contains modifier key. The modifier keys that should
 * be taken into account differ based on platform
 * @param nativeEvent
 * @returns `true` if one or more of modifier keys are `true`
 */
const isModifierKey = (nativeEvent: any): boolean => {
  if (shouldAllowShiftCtrlKeys) {
    return nativeEvent && (nativeEvent.alt || nativeEvent.altKey || nativeEvent.meta || nativeEvent.metaKey);
  } else {
    return (
      nativeEvent &&
      (nativeEvent.alt ||
        nativeEvent.altKey ||
        nativeEvent.ctrl ||
        nativeEvent.ctrlKey ||
        nativeEvent.meta ||
        nativeEvent.metaKey ||
        nativeEvent.shift ||
        nativeEvent.shiftKey)
    );
  }
};

function keyPressCallback(userCallback?: KeyCallback, ...keys: string[]) {
  const onKeyEvent = (e: KeyPressEvent) => {
    if (userCallback !== undefined && !isModifierKey(e.nativeEvent) && (keys === undefined || keys.includes(e.nativeEvent.key))) {
      userCallback(e);
      e.stopPropagation();
    }
  };
  return onKeyEvent;
}

/**
 * react-native-macos 0.78 removed native support for `validKeysDown` and `validKeysUp`. From that version,
 * react-native-macos uses `keyDownEvents` and `keyUpEvents`, the same props as win32.
 */
function usesLegacyMacOSKeyProps(): boolean {
  return Platform.OS === 'macos' && Platform.constants.reactNativeVersion.minor < 78;
}

type KeyEventDirection = 'down' | 'up';

/**
 * Gets the platform-specific props that call `userCallback` when one of `keys` goes down or up.
 * The key down and key up hooks share this worker, so both directions use the same platform rules.
 * Returns `undefined` on iOS and Android.
 */
function getKeyPropsWorker(direction: KeyEventDirection, userCallback: KeyCallback, keys: string[]): KeyPressProps | undefined {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return undefined;
  }

  const onKeyEvent = keyPressCallback(userCallback, ...keys);
  const isKeyDown = direction === 'down';

  if (Platform.OS === 'windows') {
    /**
     * https://github.com/microsoft/react-native-windows/issues/11049
     * Windows doesn't filter on `key` but on `code`, which is quite different ('A' vs 'KeyA' or 'GamepadA').
     * While this discrepancy is present, let's not specify `keyDownEvents` or `keyUpEvents`.
     */
    return isKeyDown ? { onKeyDown: onKeyEvent } : { onKeyUp: onKeyEvent };
  }

  if (usesLegacyMacOSKeyProps()) {
    // react-native-macos 0.73 and 0.74 send JS only the key events that `validKeysDown` and `validKeysUp` list.
    // Delete this branch when FURN drops support for react-native-macos < 0.78.
    return isKeyDown ? { onKeyDown: onKeyEvent, validKeysDown: keys } : { onKeyUp: onKeyEvent, validKeysUp: keys };
  }

  // win32 and react-native-macos 0.78+
  const keyEvents = keys.map((key) => ({ key }));
  return isKeyDown ? { onKeyDown: onKeyEvent, keyDownEvents: keyEvents } : { onKeyUp: onKeyEvent, keyUpEvents: keyEvents };
}

function getKeyUpPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps | undefined {
  return getKeyPropsWorker('up', userCallback, keys);
}

function getKeyDownPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps | undefined {
  return getKeyPropsWorker('down', userCallback, keys);
}

/**
 * Re-usable hook for an onKeyUp event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to handle key press
 */
export const useKeyUpProps = memoize(getKeyUpPropsWorker);

/**
 * Re-usable hook for an onKeyDown event.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyDownProps = memoize(getKeyDownPropsWorker);

/** Exposes the behavior of useKeyProps for the current platform as a boolean */
export const preferKeyDownForKeyEvents = Platform.select({
  macos: true,
  default: false,
});

/**
 * Re-usable hook for keyboard events. on macOS, this is onKeyDown, while on windows this is onKeyUp.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to handle key press
 */
export const useKeyProps = preferKeyDownForKeyEvents ? useKeyDownProps : useKeyUpProps;

/**
 * Re-usable hook for an onKeyDown event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns onKeyEvent() - Callback to determine if key was pressed, if so, call userCallback
 * @deprecated use the hook `useKeyProps` instead
 */
export function useKeyCallback(userCallback?: KeyCallback, ...keys: string[]) {
  const onKeyEvent = React.useCallback(
    (e: KeyPressEvent) => {
      if (userCallback !== undefined && (keys === undefined || keys.includes(e.nativeEvent.key))) {
        userCallback(e);
        e.stopPropagation();
      }
    },
    [keys, userCallback],
  );

  return onKeyEvent;
}
