import type { AppearanceOptions } from '@fluentui-react-native/design/theming';
import { getLegacyTokenSet } from '@fluentui-react-native/design/tokens/legacy';
import { assertNever } from 'assert-never';

function getMacOSLegacyTokenSet(mode: AppearanceOptions, isHighContrast: boolean) {
  if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  }
  if (mode !== 'light' && mode !== 'dark' && mode !== 'darkElevated') {
    assertNever(mode);
  }
  return getLegacyTokenSet({
    colorScheme: mode === 'light' ? 'light' : 'dark',
    contrast: isHighContrast ? 'highContrast' : 'standard',
    interfaceLevel: mode === 'darkElevated' ? 'elevated' : 'base',
  });
}

export function getMacOSAliasTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  return getMacOSLegacyTokenSet(mode, isHighContrast).aliases;
}

export function getMacOSShadowTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  return getMacOSLegacyTokenSet(mode, isHighContrast).shadows;
}
