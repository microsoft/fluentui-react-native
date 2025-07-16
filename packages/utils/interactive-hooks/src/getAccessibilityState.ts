import type { AccessibilityState } from 'react-native';

import { memoize } from '@fluentui-react-native/framework-base';

export const getAccessibilityState = memoize(getAccessibilityStateWorker);
export function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
