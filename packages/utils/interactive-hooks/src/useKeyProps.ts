import * as React from 'react';
import { Platform } from 'react-native';
import { memoize } from '@fluentui-react-native/memo-cache';
import { KeyCallback, KeyPressEvent, KeyPressProps } from './useKeyProps.types';

/**
 * Verifies if nativeEvent contains modifier key.
 * @param nativeEvent
 * @returns `true` if one or more of modifier keys are `true`
 */
export const isModifierKey = (nativeEvent: any): boolean => {
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
};

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

function getKeyCallbackWorker(userCallback?: KeyCallback, ...keys: string[]) {
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
      onKeyUp: getKeyCallbackWorker(userCallback, ...keys),
      validKeysUp: keys,
    },
    windows: {
      onKeyUp: getKeyCallbackWorker(userCallback, ...keys),
      keyUpEvents: keys.map((keyCode) => {
        return { key: keyCode };
      }),
    },
    // win32
    default: {
      onKeyUp: getKeyCallbackWorker(userCallback, ...keys),
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
      onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
      validKeysDown: keys,
    },
    windows: {
      onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
      keyDownEvents: keys.map((keyCode) => {
        return { key: keyCode };
      }),
    },
    // win32
    default: {
      onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
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

/**
 * Re-usable hook for keyboard events. on macOS, this is onKeyDown, while on windows this is onKeyUp.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to handle key press
 */
export const useKeyProps = memoize(getKeyUpPropsWorker);

/** Exposes the behavior of useKeyProps for the current platform as a boolean */
export const preferKeyDownForKeyEvents = Platform.select({
  macos: true,
  default: false,
});
