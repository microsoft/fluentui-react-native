import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import { darkAliasColors, lightAliasColors } from '../tokens/generated/aliases.android';
import { darkShadows, lightShadows } from '../tokens/generated/shadows.android';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  return appearance.colorScheme === 'dark' ? darkAliasColors : lightAliasColors;
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  return appearance.colorScheme === 'dark' ? darkShadows : lightShadows;
}
