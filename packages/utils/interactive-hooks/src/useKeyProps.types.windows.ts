import { IKeyPressEvent, IHandledKeyboardEvent } from 'react-native-windows';

export type KeyPressEvent = IKeyPressEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  keyDownEvents?: IHandledKeyboardEvent[]; // Windows
  onKeyUp?: KeyCallback;
  keyUpEvents?: IHandledKeyboardEvent[]; // Windows
};
