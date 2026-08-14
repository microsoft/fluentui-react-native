import * as React from 'react';
import { AccessibilityInfo } from 'react-native';

function resolveReduceMotionPreference(preference: unknown, onResolved: (value: boolean) => void) {
  if (typeof preference === 'boolean') {
    onResolved(preference);
    return;
  }

  if (preference && typeof (preference as PromiseLike<boolean>).then === 'function') {
    void (preference as PromiseLike<boolean>).then(onResolved);
  }
}

/**
 * Tracks the platform reduced motion preference.
 *
 * The hook starts as `undefined` so callers can distinguish "not yet resolved" from `false`.
 */
export function useReducedMotion(): boolean | undefined {
  const [reducedMotion, setReducedMotion] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    let alive = true;

    resolveReduceMotionPreference(AccessibilityInfo.isReduceMotionEnabled?.(), (value) => {
      if (alive) {
        setReducedMotion(value);
      }
    });

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (value) => {
      if (alive && typeof value === 'boolean') {
        setReducedMotion(value);
      }
    });

    return () => {
      alive = false;
      subscription?.remove?.();
    };
  }, []);

  return reducedMotion;
}
