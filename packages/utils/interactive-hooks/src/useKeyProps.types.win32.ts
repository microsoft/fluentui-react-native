import type { IKeyboardEvent, IHandledKeyboardEvent } from '@office-iss/react-native-win32';

export type KeyPressEvent = IKeyboardEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  keyDownEvents?: IHandledKeyboardEvent[]; // win32
  onKeyUp?: KeyCallback;
  keyUpEvents?: IHandledKeyboardEvent[]; // win32
};
