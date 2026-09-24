import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import macOSDarkAliasTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json';
import macOSDarkHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json';
import macOSLightHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json';
import macOSLightAliasTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json';
import { darkShadows, hcdarkShadows, hclightShadows, lightShadows } from '../tokens/generated/shadows.macos';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return (appearance.colorScheme === 'dark' ? macOSDarkHCAliasTokens : macOSLightHCAliasTokens) as unknown as AliasColorTokens;
  }

  return appearance.colorScheme === 'dark'
    ? (macOSDarkAliasTokens as unknown as AliasColorTokens)
    : (macOSLightAliasTokens as unknown as AliasColorTokens);
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  if (appearance.contrast === 'highContrast') {
    return appearance.colorScheme === 'dark' ? hcdarkShadows : hclightShadows;
  }

  return appearance.colorScheme === 'dark' ? darkShadows : lightShadows;
}
