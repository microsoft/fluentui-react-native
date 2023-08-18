import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabIndicatorTokens } from './TabIndicator.types';

export const defaultTabIndicatorTokens: TokenSettings<TabIndicatorTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.transparent,
  } as TabIndicatorTokens);
