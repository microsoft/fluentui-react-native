import { immutableMerge } from '@fluentui-react-native/framework-base';

import type { Theme } from '../theming';
import { mapObjectFromObject } from '../utilities/objects';
import { defaultFlexTokens, nonFluentFlexTokens } from './defaultTokens';
import type { FlexTokens } from './flex.types';
import flexFromTheme from './mappings/flex-from-theme.json' with { type: 'json' };

const defaultMappedFlexTokens = mapObjectFromObject<FlexTokens>(
  defaultFlexTokens,
  Object.fromEntries(Object.keys(flexFromTheme).map((destinationPath) => [destinationPath, destinationPath])),
);

/**
 * Build Flex tokens from the values exposed by a FURN Theme.
 */
export function flexTokensFromTheme(theme: Theme): FlexTokens {
  const mappedThemeTokens = immutableMerge(defaultMappedFlexTokens, mapObjectFromObject<FlexTokens>(theme, flexFromTheme));
  return immutableMerge(nonFluentFlexTokens, mappedThemeTokens);
}
