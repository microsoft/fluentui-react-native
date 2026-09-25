import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import { darkAliasColors, hcdarkAliasColors, hclightAliasColors, lightAliasColors } from '../tokens/generated/aliases.macos';
import { darkShadows, hcdarkShadows, hclightShadows, lightShadows } from '../tokens/generated/shadows.macos';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return appearance.colorScheme === 'dark' ? hcdarkAliasColors : hclightAliasColors;
  }

  return appearance.colorScheme === 'dark' ? darkAliasColors : lightAliasColors;
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  if (appearance.contrast === 'highContrast') {
    return appearance.colorScheme === 'dark' ? hcdarkShadows : hclightShadows;
  }

  return appearance.colorScheme === 'dark' ? darkShadows : lightShadows;
}
