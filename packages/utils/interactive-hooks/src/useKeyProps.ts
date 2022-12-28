import { KeyCallback, KeyPressProps } from './useKeyProps.types';
import { memoize } from '@fluentui-react-native/memo-cache';

function getKeyUpPropsWorker(_userCallback: KeyCallback, ..._keys: string[]): KeyPressProps {
  // No keyboard event handling support in React Native on iOS or Android
  return {};
}

function getKeyDownPropsWorker(_userCallback: KeyCallback, ..._keys: string[]): KeyPressProps {
  // No keyboard event handling support in React Native on iOS or Android
  return {};
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
