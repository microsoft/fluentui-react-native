import type { NativeSyntheticEvent } from 'react-native';

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

export type KeyPressEvent = NativeSyntheticEvent<NativeKeyEvent>;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[];
  onKeyUp?: KeyCallback;
  validKeysUp?: string[];
};
