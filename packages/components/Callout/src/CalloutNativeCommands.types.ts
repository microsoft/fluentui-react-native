import type { NativeMethods } from 'react-native';

/**
 * Omit the View-based focus functions from the Callout
 */
export interface OmittedViewFocusable {
  focus(): void;
  blur(): void;
}

export interface CalloutNativeCommands extends Omit<NativeMethods, keyof OmittedViewFocusable> {
  focusWindow: () => void;
  blurWindow: () => void;
}
