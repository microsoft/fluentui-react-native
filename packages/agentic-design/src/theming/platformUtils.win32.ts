import type { Theme } from './types/Theme.types';

export { getCurrentAppearance, setIsHighContrast } from './platformUtils.defaults';

export function isHighContrast(theme?: Theme): boolean {
  return theme?.name === 'HighContrast';
}
