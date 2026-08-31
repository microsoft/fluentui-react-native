import type { Theme } from './types/Theme.types';
import { platformAppearance, setPlatformHighContrast } from './platformAppearance';

export { getCurrentAppearance } from './platformUtils.defaults';

export function setIsHighContrast(isHighContrast: boolean): void {
  setPlatformHighContrast(isHighContrast);
}

export function isHighContrast(_theme?: Theme): boolean {
  return platformAppearance.getSnapshot().contrast === 'highContrast';
}
