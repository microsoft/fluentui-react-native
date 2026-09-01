import type { AppearanceOptions } from '../../theming';

import { getGeneratedLegacyTokenSet } from './generatedTokenSet';

export function getAliasTokens(mode: AppearanceOptions) {
  return getGeneratedLegacyTokenSet(mode === 'highContrast' ? 'light' : mode).aliases;
}

export function getShadowTokens(mode: AppearanceOptions) {
  return getGeneratedLegacyTokenSet(mode === 'highContrast' ? 'light' : mode).shadows;
}
