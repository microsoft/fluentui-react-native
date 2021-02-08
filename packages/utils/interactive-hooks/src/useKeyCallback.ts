/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyPressEvent } from './Pressability/CoreEventTypes';

export type KeyUpCallback = (args?: KeyPressEvent) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

export function useKeyCallback(_userCallback?: KeyUpCallback, ..._keys: string[]) {
  return noOp;
}
