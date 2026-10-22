import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { FocusKeyboardEvent, FocusTarget } from '@fluentui-react-native/framework-base';

/** The selection actions a bound option declares. */
export type ListboxItemOptionAction = 'select' | 'add' | 'remove';

/** A bound option as its list sees it. */
export interface ListboxItemOptionRegistration {
  readonly value: string;
  readonly disabled: boolean;
  readonly focusTarget: FocusTarget;
  /** The list's native handle for the option's view, created by `useNativeTarget`. */
  readonly nativeTarget: unknown;
  /** The option's mounted host view, which the list measures to keep it scrolled into view. */
  getHostInstance(): object | null;
}

/**
 * Supplied by the list that renders bound options (LBI-006). ListboxItem depends only on this interface, so it never
 * imports Dropdown or native-core; an item outside a list sees `undefined`.
 */
export interface ListboxItemOptionBinding {
  readonly multiselect: boolean;
  /** The number of options in the list. */
  readonly setSize: number;
  isSelected(value: string): boolean;
  /** The option's one-based position, or undefined for a value the list does not know. */
  getPosition(value: string): number | undefined;
  /** A hook that creates the list's native handle for an option's view. It is stable for the binding's lifetime. */
  useNativeTarget(): { target: unknown; ref: React.RefCallback<object> };
  register(option: ListboxItemOptionRegistration): () => void;
  onOptionFocus(value: string): void;
  onOptionBlur(value: string): void;
  onOptionHoverIn(value: string): void;
  onOptionKeyDown(value: string, event: FocusKeyboardEvent): void;
  onOptionPress(value: string, event: GestureResponderEvent): void;
  onOptionAction(value: string, action: ListboxItemOptionAction): void;
}

export const ListboxItemOptionContext = React.createContext<ListboxItemOptionBinding | undefined>(undefined);

/** The props an option's label comes from. */
export interface ListboxItemOptionLabelSource {
  content?: unknown;
  accessibilityLabel?: string;
  value: string;
}

/**
 * An option's label: its string `content`, the string children of its `content` props, its `accessibilityLabel`, or
 * its value, in that order.
 */
export function getListboxItemOptionLabel({ content, accessibilityLabel, value }: ListboxItemOptionLabelSource): string {
  if (typeof content === 'string') {
    return content;
  }
  if (content !== null && typeof content === 'object' && 'children' in content && typeof content.children === 'string') {
    return content.children;
  }
  return accessibilityLabel ?? value;
}
