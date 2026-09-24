import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import darkAliasTokens from '@fluentui-react-native/design-tokens-android/dark/tokens-aliases.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-android/light/tokens-aliases.json';
import { darkShadows, lightShadows } from '../tokens/generated/shadows.android';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  return appearance.colorScheme === 'dark'
    ? (darkAliasTokens as unknown as AliasColorTokens)
    : (lightAliasTokens as unknown as AliasColorTokens);
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  return appearance.colorScheme === 'dark' ? darkShadows : lightShadows;
}
