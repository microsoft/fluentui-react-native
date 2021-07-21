import * as lightAliasTokens from './light/tokens-alias';
import * as darkAliasTokens from './dark/tokens-alias';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') return lightAliasTokens.default;
  else if (mode === 'dark') return darkAliasTokens.default;

  return lightAliasTokens.default;
}
