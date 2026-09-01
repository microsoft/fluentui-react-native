import type { ResolvedThemeAppearance } from '../../theming/appearance.types';

export type GeneratedAppearanceName = 'light' | 'dark' | 'darkElevated' | 'lightHighContrast' | 'darkHighContrast';

export function generatedAppearanceName(appearance: ResolvedThemeAppearance): GeneratedAppearanceName {
  if (appearance.contrast === 'highContrast') {
    return appearance.colorScheme === 'dark' ? 'darkHighContrast' : 'lightHighContrast';
  }
  if (appearance.colorScheme === 'dark') {
    return appearance.interfaceLevel === 'elevated' ? 'darkElevated' : 'dark';
  }
  return 'light';
}
