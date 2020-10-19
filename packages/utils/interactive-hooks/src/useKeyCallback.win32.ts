import * as React from 'react';
import { KeyPressEvent } from './Pressability/CoreEventTypes';

export type KeyUpCallback = (args?: KeyPressEvent) => void;

/* Re-usable hook for an onKeyUp/onKeyDown event.
 ** PROPS:
 **       key - A string of the key you want to perform some action on. If undefined, always invokes userCallback
 **       userCallback - The function you want to be called once the key has been activated on key up
 ** RETURNS:
 **       onKeyEvent() - Callback to determine if key was pressed, if so, call userCallback
 */
export function useKeyCallback(userCallback?: KeyUpCallback, ...keys: string[]) {
  const onKeyEvent = React.useCallback(
    (args: KeyPressEvent) => {
      if (userCallback !== undefined && (keys === undefined || keys.includes(args.nativeEvent.key))) {
        userCallback(args);
        args.stopPropagation();
      }
    },
    [userCallback, ...keys],
  );

  return onKeyEvent;
}
