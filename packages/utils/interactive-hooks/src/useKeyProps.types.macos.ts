import { NativeSyntheticEvent } from 'react-native';

// React Native macOS doesn't have typescript types yet, so define the type here.
interface NativeKeyEvent {
  // Modifier keys
  capsLockKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  numericPadKey: boolean;
  helpKey: boolean;
  functionKey: boolean;
  // Key options
  ArrowLeft: boolean;
  ArrowRight: boolean;
  ArrowUp: boolean;
  ArrowDown: boolean;
  key: string;
}

interface KeyEvent extends NativeSyntheticEvent<NativeKeyEvent> {}

export type KeyCallback = (args?: KeyEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: any[]; // windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: any[]; // windows
};
