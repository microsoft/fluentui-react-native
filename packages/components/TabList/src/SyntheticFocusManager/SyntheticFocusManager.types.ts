import type * as React from 'react';

import type { IFocusable, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';

export interface SyntheticFocusManagerOptions {
  defaultTabbableElement?: React.RefObject<IFocusable>;
  isCircularNavigation?: boolean;
}

export interface SyntheticFocusManagerItem extends PressableFocusProps {
  key: string;
  ref: React.RefObject<IFocusable>;
}

export interface SyntheticFocusManagerListeners {
  onFocusChange?: (item?: SyntheticFocusManagerItem) => void;
  onFocusManagerEnable?: () => void;
  onFocusManagerDisable?: () => void;
}

export interface ISyntheticFocusManager {
  current: SyntheticFocusManagerItem;
  active: boolean;

  register: (item: SyntheticFocusManagerItem) => void;
  unregister: (ref: React.RefObject<IFocusable>) => void;
  next: () => void;
  prev: () => void;
  focus: (ref?: React.RefObject<IFocusable>) => void;
  blur: () => void;
  enable: () => void;
  disable: () => void;
  addListeners: (ref: React.RefObject<any>, listeners: SyntheticFocusManagerListeners) => void;
  removeListeners: (ref: React.RefObject<any>) => void;
}

export interface SyntheticFocusManagerState {
  active: boolean;
  focusManager: ISyntheticFocusManager;
  focusedRef?: React.RefObject<IFocusable>;
}
