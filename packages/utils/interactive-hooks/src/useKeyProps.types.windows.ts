import { IKeyPressEvent, IHandledKeyboardEvent } from 'react-native-windows';

export type KeyPressEvent = IKeyPressEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyboardEvent[]; // Windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: IHandledKeyboardEvent[]; // Windows
};
