import { KeyboardEvent, KeyCallback, KeyPressProps } from './useKeyProps.types';
import { memoize } from '@fluentui-react-native/memo-cache';
import * as React from 'react';
import { isModifierKey } from './isModifierKey';

/**
 * Re-usable hook for an onKeyDown event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns onKeyEvent() - Callback to determine if key was pressed, if so, call userCallback
 * @deprecated use useKeyUpProps or useKeyDownProps instead
 */
export function useKeyCallback(userCallback?: KeyCallback, ...keys: string[]) {
  const onKeyEvent = React.useCallback(
    (e: KeyboardEvent) => {
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
  const onKeyEvent = (e: KeyboardEvent) => {
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
  };
}

function getKeyDownPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  return {
    onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
  };
}

/**
 * Re-usable hook for an onKeyUp event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
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
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyProps = memoize(getKeyUpPropsWorker);

/** Exposes the behavior of useKeyProps for the current platform as a boolean */
export const preferKeyDownForKeyEvents = false;
