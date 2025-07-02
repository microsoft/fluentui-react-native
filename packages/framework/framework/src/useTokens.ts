import type { Theme } from '@fluentui-react-native/theme-types';
import type { UseTokens as UseTokensCore } from '@fluentui-react-native/use-tokens';
import { buildUseTokens as buildUseTokensCore } from '@fluentui-react-native/use-tokens';

import { themeHelper } from './themeHelper';
import type { TokenSettings } from './useStyling';

export { applyTokenLayers, applyPropsToTokens, customizable, patchTokens } from '@fluentui-react-native/use-tokens';

// A hook function to build a set of tokens from a passed in theme as well as a cache object
export type UseTokens<TTokens> = UseTokensCore<TTokens, Theme>;
export type { CustomizableComponent } from '@fluentui-react-native/use-tokens';

export function buildUseTokens<TTokens>(...tokens: TokenSettings<TTokens>[]): UseTokens<TTokens> {
  return buildUseTokensCore(themeHelper.getComponentInfo, ...tokens);
}
