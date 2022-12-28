import { IKeyPressEvent, IHandledKeyPressEvent } from '@office-iss/react-native-win32';

export type KeyPressEvent = IKeyPressEvent;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyPressEvent[]; // win32
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: IHandledKeyPressEvent[]; // win32
};
