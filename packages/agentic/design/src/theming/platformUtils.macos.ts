import type { Theme } from './types/Theme.types';

export { getCurrentAppearance } from './platformUtils.defaults';

let isHighContrastEnabled = false;

export function setIsHighContrast(isHighContrast: boolean) {
  isHighContrastEnabled = isHighContrast;
}

export function isHighContrast(_theme?: Theme): boolean {
  return isHighContrastEnabled;
}
