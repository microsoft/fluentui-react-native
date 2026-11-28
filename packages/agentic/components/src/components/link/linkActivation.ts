import type { FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import type { GestureResponderEvent } from 'react-native';

export function isNavigationPress(event: GestureResponderEvent): boolean {
  const { key, code, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent as FocusKeyboardEvent['nativeEvent'];
  return !(key || code) || ((key === 'Enter' || code === 'Enter') && !altKey && !ctrlKey && !metaKey && !shiftKey);
}
