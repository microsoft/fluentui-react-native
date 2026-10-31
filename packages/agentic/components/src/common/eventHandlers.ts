import type { GestureResponderEvent } from 'react-native';

/** Calls each defined handler in order with the same arguments. */
export function composeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

/** Whether a press came from Enter or Space rather than a pointer. */
export function isKeyboardPress(event: GestureResponderEvent | undefined): boolean {
  const native: object | undefined = event?.nativeEvent;
  return native != null && ('key' in native || 'code' in native);
}
