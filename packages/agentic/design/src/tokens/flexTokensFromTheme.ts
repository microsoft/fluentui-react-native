import { immutableMerge } from '@fluentui-react-native/framework-base';

import { defaultResolvedThemeAppearance } from '../theming/appearance';
import type { ResolvedThemeAppearance } from '../theming/appearance.types';
import type { Theme } from '../theming';
import { getDefaultFlexTokens } from './defaultTokens';
import type { FlexTokens } from './flex.types';
import { projectThemeToFlex } from './mappings/flexFromTheme.generated';

/**
 * Build Flex tokens from the values exposed by a FURN Theme.
 */
export function flexTokensFromTheme(theme: Theme, appearance: ResolvedThemeAppearance = defaultResolvedThemeAppearance): FlexTokens {
  return immutableMerge(getDefaultFlexTokens(appearance), projectThemeToFlex(theme));
}
