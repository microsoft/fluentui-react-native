/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyPressEvent } from './Pressability/CoreEventTypes';

export type KeyCallback = (args?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyUp?: KeyCallback;
  validKeysUp?: string[];
  onKeyDown?: KeyCallback;
  validKeysDown?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

/**
 * Re-usable hook for an onKeyDown event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns onKeyEvent() - Callback to determine if key was pressed, if so, call userCallback
 * @deprecated use useKeyUpProps or useKeyDownProps instead
 */
export function useKeyCallback(_userCallback?: KeyCallback, ..._keys: string[]) {
  return noOp;
}

/**
 * Re-usable hook for an onKeyUp event. noOp on unsupported platforms.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyUpProps = noOp;

/**
 * Re-usable hook for an onKeyDown event. noOp on unsupported platforms.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyDownProps = noOp;
