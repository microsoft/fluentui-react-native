import type { Theme } from '@fluentui-react-native/theme-types';
import { AppTheme } from 'react-native-windows';

export function setIsHighContrast(_isHighContrast: boolean) {
  // noop, stub for windows;
}

export function isHighContrast(_t?: Theme) {
  return AppTheme.isHighContrast;
}
