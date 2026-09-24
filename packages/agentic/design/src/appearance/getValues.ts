import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import hcAliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';
import { darkShadows, hcShadows, lightShadows, darkGrayShadows } from '../tokens/generated/shadows';
import type { EffectiveAppearance } from './appearance.types';

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return hcAliasTokens as unknown as AliasColorTokens;
  }

  if (appearance.colorScheme === 'dark') {
    return appearance.interfaceLevel === 'elevated'
      ? (blackAliasTokens as unknown as AliasColorTokens)
      : (darkGrayAliasTokens as unknown as AliasColorTokens);
  }
  return colorfulAliasTokens as unknown as AliasColorTokens;
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
