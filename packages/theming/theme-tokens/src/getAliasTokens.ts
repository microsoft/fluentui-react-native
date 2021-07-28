import * as lightAliasTokens from './light/tokens-alias';
import * as darkAliasTokens from './dark/tokens-alias';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightAliasTokens.default;
  } else if (mode === 'dark') {
    return darkAliasTokens.default;
  } else {
    assertNever(mode);
  }

  return lightAliasTokens.default;
}
