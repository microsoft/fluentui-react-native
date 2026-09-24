import type { AppearanceOptions } from '../../theming';
import {
  getAliasTokens as getEffectiveAliasTokens,
  getShadowTokens as getEffectiveShadowTokens,
  type EffectiveAppearance,
} from '../../appearance';
import { assertNever } from 'assert-never';

function toEffectiveAppearance(mode: AppearanceOptions): EffectiveAppearance {
  switch (mode) {
    case 'light':
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
    case 'dark':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
    case 'darkElevated':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' };
    case 'highContrast':
      return { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' };
    default:
      assertNever(mode);
  }
}

export function getAliasTokens(mode: AppearanceOptions) {
  return getEffectiveAliasTokens(toEffectiveAppearance(mode));
}

export function getShadowTokens(mode: AppearanceOptions) {
  return getEffectiveShadowTokens(toEffectiveAppearance(mode));
}
