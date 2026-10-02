import type * as React from 'react';
import type { AccessibilityState, Pressable } from 'react-native';
import type { FocusKeyboardEvent, PropsWithRefOf } from '@fluentui-react-native/framework-base';

import type { RadioProps, RadioSlots, RadioState } from '../radio/radio.types';

export type RadioGroupItemSlots = RadioSlots;
export type RadioGroupItemProps = Omit<
  RadioProps,
  | 'label'
  | 'selected'
  | 'children'
  | 'accessible'
  | 'focusable'
  | 'tabIndex'
  | 'role'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessibilityPosInSet'
  | 'accessibilitySetSize'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'keyDownEvents'
  | 'keyUpEvents'
  | 'validKeysDown'
  | 'validKeysUp'
  | 'aria-checked'
  | 'aria-selected'
  | 'aria-disabled'
  | 'aria-required'
> & {
  value: string;
  label: string;
  children?: never;
  accessibilityState?: Omit<AccessibilityState, 'checked' | 'selected' | 'disabled' | 'required' | 'multiselectable'>;
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
  as?: React.ComponentType<PropsWithRefOf<typeof Pressable>>;
};

export type RadioGroupItemState = RadioState & { value: string };
