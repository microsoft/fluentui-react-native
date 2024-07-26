import type * as React from 'react';

import type { IFocusable, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';

export interface SyntheticFocusManagerOptions {
  /**
   * The starting element to set synthetic focus on
   */
  defaultTabbableElement?: React.RefObject<IFocusable>;
  /**
   * Flag to enable circular navigation, allowing focus to circle back to the start or end after reaching the last or first tab stops.
   */
  isCircularNavigation?: boolean;
}

/**
 * This class represents a UI element that is tracked by the manager
 */
export interface SyntheticFocusManagerItem extends PressableFocusProps {
  /**
   * Ref attached to the element this item represents
   */
  ref: React.RefObject<IFocusable>;
  /**
   * Flag stating whether this element can be focused
   */
  focusable?: boolean;
  /**
   * Priority of the item when cycling through focus
   */
  order?: number;
  /**
   * Optional key that can be assigned to the item
   */
  key?: string;
}

export interface SyntheticFocusManagerListeners {
  onFocusChange?: (item?: SyntheticFocusManagerItem) => void;
  onFocusManagerEnable?: () => void;
  onFocusManagerDisable?: () => void;
}

export interface ISyntheticFocusManager {
  /**
   * The current focused item in the manager
   */
  current: SyntheticFocusManagerItem;
  /**
   * Flag stating whether the manager is enabled to show synthetic focus
   */
  active: boolean;
  /**
   * Method to add an element tracked by the manager
   */
  register: (item: SyntheticFocusManagerItem) => void;
  /**
   * Update an existing element's props within the manager
   */
  update: (ref: React.RefObject<IFocusable>, updates: Partial<SyntheticFocusManagerItem>) => void;
  /**
   * Remove an element from the manager
   */
  unregister: (ref: React.RefObject<IFocusable>) => void;
  /**
   * If the manager is active, this switches visual focus to the next element registered in the manager
   */
  next: () => void;
  /**
   * If the manager is active, this switches visual focus to the previous element registered in the manager
   */
  prev: () => void;
  /**
   * If the manager is active, this switches focus to the element with the passed ref within the manager
   */
  focus: (ref?: React.RefObject<IFocusable>) => void;
  /**
   * If the manager is active, this removes visual focus from the currently focused element in the manager.
   */
  blur: () => void;
  /**
   * Enables this manager to render fake focus to the registered elements
   */
  enable: () => void;
  /**
   * Removes "fake" focus being rendered for the registered elements
   */
  disable: () => void;
  /**
   * Given a react ref object, attach callbacks to be triggered when focus changes or when the manager is enabled / disabled
   */
  addListeners: (ref: React.RefObject<any>, listeners: SyntheticFocusManagerListeners) => void;
  /**
   * Unregister the callbacks assigned to the passed ref
   */
  removeListeners: (ref: React.RefObject<any>) => void;
}

export interface SyntheticFocusState {
  active: boolean;
  focusManager: ISyntheticFocusManager;
  focusedRef?: React.RefObject<IFocusable>;
}
