import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import darkAliasTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json';
import darkElevatedAliasTokens from '@fluentui-react-native/design-tokens-ios/elevateddark/tokens-aliases.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json';
import hcLightAliasTokens from '@fluentui-react-native/design-tokens-ios/hclight/tokens-aliases.json';
import hcDarkAliasTokens from '@fluentui-react-native/design-tokens-ios/hcdark/tokens-aliases.json';
import { darkShadows, elevateddarkShadows, hcdarkShadows, hclightShadows, lightShadows } from '../tokens/generated/shadows.ios';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return (appearance.colorScheme === 'dark' ? hcDarkAliasTokens : hcLightAliasTokens) as unknown as AliasColorTokens;
  }

  if (appearance.colorScheme === 'dark' && appearance.interfaceLevel === 'elevated') {
    return darkElevatedAliasTokens as unknown as AliasColorTokens;
  }

  return appearance.colorScheme === 'dark'
    ? (darkAliasTokens as unknown as AliasColorTokens)
    : (lightAliasTokens as unknown as AliasColorTokens);
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  if (appearance.contrast === 'highContrast') {
    return (appearance.colorScheme === 'dark' ? hcdarkShadows : hclightShadows) as ThemeShadowDefinition;
  }

  if (appearance.colorScheme === 'dark' && appearance.interfaceLevel === 'elevated') {
    return elevateddarkShadows as ThemeShadowDefinition;
  }

  return appearance.colorScheme === 'dark' ? (darkShadows as ThemeShadowDefinition) : (lightShadows as ThemeShadowDefinition);
}
