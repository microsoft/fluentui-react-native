import type { Theme } from '@fluentui-react-native/theme-types';

export function setIsHighContrast(_isHighContrast: boolean) {
  // noop, stub for win32;
}

export function isHighContrast(t?: Theme) {
  if (!t) {
    return false;
  }

  return t.name === 'HighContrast';
}
