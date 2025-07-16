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

function getKeyUpPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  const keyboardProps = Platform.select({
    ios: undefined,
    android: undefined,
    macos: {
      onKeyUp: keyPressCallback(userCallback, ...keys),
      validKeysUp: keys,
    },
    windows: {
      /**
       * https://github.com/microsoft/react-native-windows/issues/11049
       * Windows doesn't filter on `key` but on `code`, which is quite different ('A' vs 'KeyA' or 'GamepadA').
       * While this discrepancy is present, let's not specify `keyUpEvents`.
       */
      onKeyUp: keyPressCallback(userCallback, ...keys),
    },
    // win32
    default: {
      onKeyUp: keyPressCallback(userCallback, ...keys),
      keyUpEvents: keys.map((keyCode) => {
        return { key: keyCode };
      }),
    },
  });
  return keyboardProps;
}

function getKeyDownPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  const keyboardProps = Platform.select({
    ios: undefined,
    android: undefined,
    macos: {
      onKeyDown: keyPressCallback(userCallback, ...keys),
      validKeysDown: keys,
    },
    windows: {
      /**
       * https://github.com/microsoft/react-native-windows/issues/11049
       * Windows doesn't filter on `key` but on `code`, which is quite different ('A' vs 'KeyA' or 'GamepadA').
       * While this discrepancy is present, let's not specify `keyDownEvents`.
       */
      onKeyDown: keyPressCallback(userCallback, ...keys),
    },
    // win32
    default: {
      onKeyDown: keyPressCallback(userCallback, ...keys),
      keyDownEvents: keys.map((keyCode) => {
        return { key: keyCode };
      }),
    },
  });
  return keyboardProps;
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
