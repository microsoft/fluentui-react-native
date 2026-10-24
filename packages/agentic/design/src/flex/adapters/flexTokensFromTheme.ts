import { immutableMerge } from '@fluentui-react-native/framework-base';

import type { Theme } from '../../fluent/types/Theme.types';
import { mapObjectFromObject } from '../../utilities/objects';
import { defaultFlexTokens, nonFluentFlexTokens } from '../defaults/defaultTokens';
import type { FlexTokens } from '../tokens.types';
import flexFromTheme from '../../tokens/mappings/flex-from-theme.json' with { type: 'json' };

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
