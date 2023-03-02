import type { Theme } from '@fluentui-react-native/theme-types';

let isHighContrastEnabled = false;

export function setIsHighContrast(isHighContrast: boolean) {
  isHighContrastEnabled = isHighContrast;
}

export function isHighContrast(_t?: Theme) {
  return isHighContrastEnabled;
}
