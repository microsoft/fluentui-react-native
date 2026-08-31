import type { ThemeAppearanceSourceSnapshot, ThemeAppearanceStore } from './appearance.types';

type NativeSubscribe = (listener: () => void) => () => void;

function snapshotsEqual(left: ThemeAppearanceSourceSnapshot, right: ThemeAppearanceSourceSnapshot): boolean {
  return left.colorScheme === right.colorScheme && left.contrast === right.contrast && left.interfaceLevel === right.interfaceLevel;
}

export function createThemeAppearanceSource(
  readSnapshot: () => ThemeAppearanceSourceSnapshot,
  subscribeNative?: NativeSubscribe,
): ThemeAppearanceStore {
  let snapshot = Object.freeze({ ...readSnapshot() });
  let unsubscribeNative: (() => void) | undefined;
  let pendingNotification = false;
  const listeners = new Set<() => void>();

  const refresh = (notify: boolean) => {
    const next = readSnapshot();
    const changed = !snapshotsEqual(snapshot, next);
    if (changed) {
      snapshot = Object.freeze({ ...next });
    }
    if (!notify) {
      pendingNotification ||= changed;
      return;
    }
    if (changed || pendingNotification) {
      pendingNotification = false;
      for (const listener of listeners) {
        listener();
      }
    }
  };

  return {
    getSnapshot() {
      refresh(false);
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && subscribeNative) {
        unsubscribeNative = subscribeNative(() => refresh(true));
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          unsubscribeNative?.();
          unsubscribeNative = undefined;
        }
      };
    },
    refresh() {
      refresh(true);
    },
  };
}
