import { IKeyboardEvent, IHandledKeyboardEvent } from '@office-iss/react-native-win32';

export type KeyboardEvent = IKeyboardEvent;

export type KeyCallback = (e?: KeyboardEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyboardEvent[]; // win32
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: IHandledKeyboardEvent[]; // win32
};
