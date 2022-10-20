import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

export const getAccessibilityState = memoize(getAccessibilityStateWorker);
export function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
