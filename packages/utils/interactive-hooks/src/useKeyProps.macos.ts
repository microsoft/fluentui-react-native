import { KeyCallback, KeyPressProps } from './useKeyProps';
import { KeyPressEvent } from './Pressability/CoreEventTypes';
import { memoize } from '@fluentui-react-native/memo-cache';

function getKeyCallbackWorker(userCallback?: KeyCallback, ...keys: string[]) {
  const onKeyEvent = (args: KeyPressEvent) => {
    if (userCallback !== undefined && (keys === undefined || keys.includes(args.nativeEvent.key))) {
      userCallback(args);
      args.stopPropagation();
    }
  };
  return onKeyEvent;
}

function getKeyUpPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  return {
    onKeyUp: getKeyCallbackWorker(userCallback, ...keys),
    validKeysUp: keys, // macOS needs an array of supported keys passed as well
  };
}

function getKeyDownPropsWorker(userCallback: KeyCallback, ...keys: string[]): KeyPressProps {
  return {
    onKeyDown: getKeyCallbackWorker(userCallback, ...keys),
    validKeysDown: keys, // macOS needs an array of supported keys passed as well
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
