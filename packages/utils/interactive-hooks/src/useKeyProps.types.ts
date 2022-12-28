import { KeyPressEvent } from './Pressability/CoreEventTypes';

export type KeyCallback = (args?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[]; // macOS
  keyDownEvents?: any[]; // windows
  onKeyUp?: KeyCallback;
  validKeysUp?: string[]; // macOS
  keyUpEvents?: any[]; // windows
};
