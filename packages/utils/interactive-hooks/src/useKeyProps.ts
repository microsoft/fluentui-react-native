/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyPressEvent } from './Pressability/CoreEventTypes';
import { IHandledKeyboardEvent } from '@office-iss/react-native-win32';

export type KeyCallback = (args?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyboardEvent[]; // win32
  onKeyUp?: KeyCallback;
  validKeysUp?: string[];
  keyUpEvents?: IHandledKeyboardEvent[]; // win32
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

/**
 * Re-usable hook for an onKeyDown event.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns onKeyEvent() - Callback to determine if key was pressed, if so, call userCallback
 * @deprecated use the hook `useKeyProps` instead
 */
export function useKeyCallback(_userCallback?: KeyCallback, ..._keys: string[]) {
  return noOp;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp2 = (_userCallback: KeyCallback, ..._keys: string[]) => {
  return {};
};

/**
 * Re-usable hook for an onKeyUp event. noOp on unsupported platforms.
 * @param userCallback The function you want to be called once the key has been activated on key up
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyUpProps = noOp2;

/**
 * Re-usable hook for an onKeyDown event. noOp on unsupported platforms.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyDownProps = noOp2;

/**
 * Re-usable hook for keyboard events. on macOS, this is onKeyDown, while on windows this is onKeyUp.
 * @param userCallback The function you want to be called once the key has been activated on key down
 * @param keys A string of the key you want to perform some action on. If undefined, always invokes userCallback
 * @returns KeyPressProps: An object containing the correct platform specific props to  handle key press
 */
export const useKeyProps = noOp2;
