import { IKeyPressEvent, IHandledKeyPressEvent } from 'react-native-windows';

export type KeyPressEvent = IKeyPressEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyPressEvent[]; // Windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: IHandledKeyPressEvent[]; // Windows
};
