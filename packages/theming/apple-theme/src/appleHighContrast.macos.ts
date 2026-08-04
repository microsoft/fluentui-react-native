import { isHighContrast, setIsHighContrast as setIsHighContrastCore } from '@fluentui-react-native/design/theming';

export function setIsHighContrast(newIsHighContrast: boolean) {
  setIsHighContrastCore(newIsHighContrast);
}

export function getIsHighContrast() {
  return isHighContrast();
}
