import { buildUseTokens as buildUseTokensCore, UseTokens as UseTokensCore } from '@fluentui-react-native/use-tokens';
import { themeHelper } from './themeHelper';
import { Theme } from '@fluentui-react-native/theme-types';
import { TokenSettings } from './useStyling';

export { applyTokenLayers, applyPropsToTokens, customizable, patchTokens } from '@fluentui-react-native/use-tokens';

export type UseTokens<TTokens> = UseTokensCore<TTokens, Theme>;

export function buildUseTokens<TTokens>(...tokens: TokenSettings<TTokens>[]): UseTokens<TTokens> {
  return buildUseTokensCore(themeHelper.getComponentInfo, ...tokens);
}
