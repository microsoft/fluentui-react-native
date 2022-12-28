import { IKeyboardEvent, IHandledKeyboardEvent } from 'react-native-windows';

export type KeyCallback = (args?: IKeyboardEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: IHandledKeyboardEvent[]; // Windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: IHandledKeyboardEvent[]; // Windows
};
