import { findNodeHandle } from 'react-native';

import type { IFocusable, FocusEvent, BlurEvent } from '@fluentui-react-native/interactive-hooks';

import type {
  ISyntheticFocusManager,
  SyntheticFocusManagerItem,
  SyntheticFocusManagerOptions,
  SyntheticFocusManagerListeners,
} from './SyntheticFocusManager.types';

type FocusableRef = React.RefObject<IFocusable>;

function getFakeEvent(ref: FocusableRef): FocusEvent | BlurEvent {
  const target = findNodeHandle(ref.current);
  return {
    nativeEvent: { target },
  } as FocusEvent | BlurEvent;
}

export class SyntheticFocusManager implements ISyntheticFocusManager {
  private items: SyntheticFocusManagerItem[];
  private itemMap: Map<FocusableRef, SyntheticFocusManagerItem>;
  private listenerMap: Map<React.RefObject<any>, SyntheticFocusManagerListeners>;
  private currentIndex: number;
  private isEnabled: boolean;
  private isCircularNavigation: boolean;
  private defaultTabbableElement?: FocusableRef;

  get active(): boolean {
    return this.isEnabled;
  }

  get current(): SyntheticFocusManagerItem | undefined {
    return this.currentIndex >= 0 ? this.items[this.currentIndex] : undefined;
  }

  constructor(options?: SyntheticFocusManagerOptions) {
    this.items = [];
    this.itemMap = new Map();
    this.listenerMap = new Map();
    this.currentIndex = 0;
    this.isEnabled = false;
    this.defaultTabbableElement = options?.defaultTabbableElement;
    this.isCircularNavigation = options?.isCircularNavigation ?? false;
  }

  register(item: SyntheticFocusManagerItem) {
    this.items.push(item);
    this.itemMap.set(item.ref, item);

    if (this.defaultTabbableElement && this.defaultTabbableElement === item.ref) {
      this.currentIndex = this.items.length - 1;
    }
  }

  update(ref: FocusableRef, updates: Partial<SyntheticFocusManagerItem>) {
    const item = this.itemMap.get(ref);
    Object.assign(item, updates);
  }

  unregister(ref: FocusableRef) {
    const indexToRemove = this.items.findIndex((item) => item.ref === ref);
    if (indexToRemove < 0) {
      throw new Error('Cannot unregister an item that does not exist in the SyntheticFocusManager');
    }

    if (this.currentIndex === indexToRemove) {
      this.currentIndex = 0;
    }

    this.items.splice(indexToRemove, 1);
    this.itemMap.delete(ref);
  }

  next() {
    this.current.onBlur?.(getFakeEvent(this.current.ref));
    const nextIndex = this.currentIndex + 1;
    if (this.isCircularNavigation) {
      this.currentIndex = nextIndex % this.items.length;
    } else {
      this.currentIndex = Math.min(this.items.length - 1, nextIndex);
    }
    this.current.onFocus?.(getFakeEvent(this.current.ref));
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusChange?.(this.current);
    });
  }

  prev() {
    this.current.onBlur?.(getFakeEvent(this.current.ref));
    const prevIndex = this.currentIndex - 1;
    if (this.isCircularNavigation) {
      this.currentIndex = prevIndex < 0 ? this.items.length - 1 : prevIndex;
    } else {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    }
    this.current.onFocus?.(getFakeEvent(this.current.ref));
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusChange?.(this.current);
    });
  }

  focus(ref?: FocusableRef) {
    // implement
    const focusedRef = ref ?? this.defaultTabbableElement;
    let indexToFocus = 0;

    if (focusedRef) {
      indexToFocus = this.items.findIndex((item) => item.ref === focusedRef);
    }

    this.currentIndex = indexToFocus;
    this.current.onFocus?.(getFakeEvent(this.current.ref));
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusChange?.(this.current);
    });
  }

  blur() {
    this.current.onBlur?.(getFakeEvent(this.current.ref));
    this.currentIndex = -1;
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusChange?.();
    });
  }

  enable() {
    this.isEnabled = true;
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusManagerEnable?.();
    });
  }

  disable() {
    this.isEnabled = false;
    this.listenerMap.forEach((listeners) => {
      listeners.onFocusManagerDisable?.();
    });
  }

  addListeners(ref: React.RefObject<any>, listeners: SyntheticFocusManagerListeners) {
    this.listenerMap.set(ref, listeners);
  }

  removeListeners(ref: React.RefObject<any>) {
    this.listenerMap.delete(ref);
  }
}
