import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import { darkAliasColors, darkGrayAliasColors, hcAliasColors, lightAliasColors } from '../tokens/generated/aliases';
import { darkShadows, hcShadows, lightShadows, darkGrayShadows } from '../tokens/generated/shadows';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return hcAliasColors;
  }

  if (appearance.colorScheme === 'dark') {
    return appearance.interfaceLevel === 'elevated' ? darkAliasColors : darkGrayAliasColors;
  }
  return lightAliasColors;
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  if (appearance.contrast === 'highContrast') {
    return hcShadows;
  }

  if (appearance.colorScheme === 'dark') {
    return appearance.interfaceLevel === 'elevated' ? darkGrayShadows : darkShadows;
  }
  return lightShadows;
}
