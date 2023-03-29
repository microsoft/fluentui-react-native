import { isHighContrast, setIsHighContrast as setIsHighContrastCore } from '@fluentui-react-native/theming-utils';

export function setIsHighContrast(newIsHighContrast: boolean) {
  setIsHighContrastCore(newIsHighContrast);
}

export function getIsHighContrast() {
  return isHighContrast();
}
