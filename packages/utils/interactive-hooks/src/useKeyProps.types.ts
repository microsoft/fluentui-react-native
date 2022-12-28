import { NativeSyntheticEvent } from 'react-native';

export type KeyPressEvent = NativeSyntheticEvent<any>;

export type KeyCallback = (e?: KeyPressEvent) => void;

export type KeyPressProps = {
  onKeyDown?: KeyCallback;
  validKeysDown?: string[];
  onKeyUp?: KeyCallback;
  validKeysUp?: string[];
};
