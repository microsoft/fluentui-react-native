import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabListTokens } from '.';

export const defaultTabListTokens: TokenSettings<TabListTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.transparent,
    flexDirection: 'row',
  } as TabListTokens);
