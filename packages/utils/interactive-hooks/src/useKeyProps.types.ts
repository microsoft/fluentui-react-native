import type { NativeSyntheticEvent } from 'react-native';

export type KeyPressEvent = NativeSyntheticEvent<any>;

export type KeyCallback = (e: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: any[]; // windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: any[]; // windows
};
