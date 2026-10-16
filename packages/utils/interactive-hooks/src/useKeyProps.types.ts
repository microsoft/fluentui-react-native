import type { KeyEventHandler } from '@fluentui-react-native/adapters';
export type { KeyEventHandler as KeyCallback, NativeKeyEvent as KeyPressEvent } from '@fluentui-react-native/adapters';

export type KeyPressProps = {
  onKeyDown?: KeyEventHandler;
  /**
   * The keys that the view handles on key down. Only react-native-macos < 0.78 supports this prop.
   * @deprecated Use `keyDownEvents`. react-native-macos 0.78 removed native support for `validKeysDown`.
   */
  validKeysDown?: string[];
  /** The key events that the view handles on key down, for example `[{ key: 'Enter' }]`. Used on win32 and react-native-macos 0.78+. */
  keyDownEvents?: any[];
  onKeyUp?: KeyEventHandler;
  /**
   * The keys that the view handles on key up. Only react-native-macos < 0.78 supports this prop.
   * @deprecated Use `keyUpEvents`. react-native-macos 0.78 removed native support for `validKeysUp`.
   */
  validKeysUp?: string[];
  /** The key events that the view handles on key up, for example `[{ key: 'Enter' }]`. Used on win32 and react-native-macos 0.78+. */
  keyUpEvents?: any[];
};
