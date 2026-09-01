import type { AppearanceOptions } from '../../theming';

import { generatedLegacyTokenDefinitions as windowsTokenDefinitions } from './generated/tokenSets.windowsSource';
import { getLegacyTokenSetForDefinitions } from './generatedTokenSet';
import { hcAliasTokens } from './highContrast/tokens-alias';
import { hcShadowTokens } from './highContrast/tokens-shadow';

function getWindowsTokenSet(mode: AppearanceOptions) {
  return getLegacyTokenSetForDefinitions(windowsTokenDefinitions, {
    colorScheme: mode === 'light' || mode === 'highContrast' ? 'light' : 'dark',
    contrast: mode === 'highContrast' ? 'highContrast' : 'standard',
    interfaceLevel: mode === 'darkElevated' ? 'elevated' : 'base',
  });
}

export function getAliasTokens(mode: AppearanceOptions) {
  return mode === 'highContrast' ? hcAliasTokens : getWindowsTokenSet(mode).aliases;
}

export function getShadowTokens(mode: AppearanceOptions) {
  return mode === 'highContrast' ? hcShadowTokens : getWindowsTokenSet(mode).shadows;
}
