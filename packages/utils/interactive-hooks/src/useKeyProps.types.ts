import type { KeyEventHandler } from '@fluentui-react-native/adapters';
export type { KeyEventHandler as KeyCallback, NativeKeyEvent as KeyPressEvent } from '@fluentui-react-native/adapters';

export type KeyPressProps = {
  onKeyDown?: KeyEventHandler;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: any[]; // windows
  onKeyUp?: KeyEventHandler;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: any[]; // windows
};
