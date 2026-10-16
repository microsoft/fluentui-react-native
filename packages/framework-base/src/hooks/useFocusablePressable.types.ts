import type { PressableProps } from 'react-native';

import type { FocusTargetEvent } from './focusTarget';
import type { PointerFocusMode } from './pointerFocus';

export interface FocusKeyboardEvent extends FocusTargetEvent {
  readonly nativeEvent: {
    readonly target?: unknown;
    readonly key?: string;
    readonly code?: string;
    readonly altKey?: boolean;
    readonly ctrlKey?: boolean;
    readonly metaKey?: boolean;
    readonly shiftKey?: boolean;
  };
  readonly defaultPrevented?: boolean;
  preventDefault?(): void;
  stopPropagation?(): void;
}

export interface FocusablePressableOptions {
  /** How a pointer press moves keyboard focus to the target. Defaults to the platform convention. */
  pointerFocus?: PointerFocusMode;
}

export type FocusablePressableProps = Omit<PressableProps, 'onKeyDown' | 'onKeyUp'> & {
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
};
