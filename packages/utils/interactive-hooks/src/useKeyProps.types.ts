import { NativeSyntheticEvent } from 'react-native';

type KeyboardEvent = NativeSyntheticEvent<any>;

export type KeyCallback = (args?: KeyboardEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: any[]; // windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: any[]; // windows
};
