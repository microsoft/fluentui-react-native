import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';
import type { AppearanceOptions } from '@fluentui-react-native/design/theming';
import { assertNever } from 'assert-never';

function appearanceFromLegacy(mode: AppearanceOptions, isHighContrast: boolean): EffectiveAppearance {
  switch (mode) {
    case 'light':
      return { colorScheme: 'light', contrast: isHighContrast ? 'highContrast' : 'standard', interfaceLevel: 'base' };
    case 'dark':
      return { colorScheme: 'dark', contrast: isHighContrast ? 'highContrast' : 'standard', interfaceLevel: 'base' };
    case 'darkElevated':
      return { colorScheme: 'dark', contrast: isHighContrast ? 'highContrast' : 'standard', interfaceLevel: 'elevated' };
    case 'highContrast':
      throw new Error('highContrast is not a valid AppearanceOptions on macOS');
    default:
      assertNever(mode);
  }
}

export function getMacOSAliasTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  return getAliasTokens(appearanceFromLegacy(mode, isHighContrast));
}

export function getMacOSShadowTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  return getShadowTokens(appearanceFromLegacy(mode, isHighContrast));
}
