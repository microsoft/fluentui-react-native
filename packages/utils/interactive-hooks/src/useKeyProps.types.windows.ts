import type { IKeyboardEvent, IHandledKeyboardEvent } from 'react-native-windows';

export type KeyPressEvent = IKeyboardEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  keyDownEvents?: IHandledKeyboardEvent[]; // Windows
  onKeyUp?: KeyCallback;
  keyUpEvents?: IHandledKeyboardEvent[]; // Windows
};
