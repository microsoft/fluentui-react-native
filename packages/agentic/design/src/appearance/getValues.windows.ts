import type { AliasColorTokens } from '../theming/types/Color.types';
import type { ThemeShadowDefinition } from '../theming/types/Shadow.types';
import darkAliasTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-aliases.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-aliases.json';
import rawHcAliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';
import { darkShadows, lightShadows } from '../tokens/generated/shadows.windows';
import type { EffectiveAppearance } from './appearance.types';
import { processAliasTokens, transformWindowsPlatformColorName } from './processAliasTokens';

// Classic Windows (UWP) apps reference system colors via the `SystemColor...Color` platform-color name.
// Windows doesn't ship its own high-contrast alias JSON, so the win32 pipeline output is reused here.
const hcAliasTokens = processAliasTokens(rawHcAliasTokens, transformWindowsPlatformColorName);

export function getAliasTokens(appearance: EffectiveAppearance): AliasColorTokens {
  if (appearance.contrast === 'highContrast') {
    return hcAliasTokens as unknown as AliasColorTokens;
  }

  return appearance.colorScheme === 'dark'
    ? (darkAliasTokens as unknown as AliasColorTokens)
    : (lightAliasTokens as unknown as AliasColorTokens);
}

export function getShadowTokens(appearance: EffectiveAppearance): ThemeShadowDefinition {
  return appearance.colorScheme === 'dark' ? (darkShadows as ThemeShadowDefinition) : (lightShadows as ThemeShadowDefinition);
}
