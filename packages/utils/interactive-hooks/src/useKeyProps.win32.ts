import { KeyPressEvent, KeyCallback, KeyPressProps } from './useKeyProps.types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { isModifierKey } from './isModifierKey';
import * as React from 'react';

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

export function getKeyCallbackWorker(userCallback?: KeyCallback, ...keys: string[]) {
  const onKeyEvent = (e: KeyPressEvent) => {
    if (userCallback !== undefined && !isModifierKey(e.nativeEvent) && (keys === undefined || keys.includes(e.nativeEvent.key))) {
      userCallback(e);
      e.stopPropagation();
    }
  };
  return onKeyEvent;
}

function getKeyUpPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  return {
    onKeyUp: getKeyCallbackWorker(userCallback, ...keys),
    // Optional on Win32 to know which key events to suppress natively
    keyUpEvents: keys.map((keyCode) => {
      return { key: keyCode };
    }),
  };
}

function getKeyDownPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  return {
    onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
    // Optional on Win32 to know which key events to suppress natively
    keyDownEvents: keys.map((keyCode) => {
      return { key: keyCode };
    }),
  };
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
export const preferKeyDownForKeyEvents = false;
