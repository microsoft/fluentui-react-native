import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabListTokens } from './TabList.types';

export const defaultTabListTokens: TokenSettings<TabListTokens, Theme> = () =>
  ({
    direction: 'row',
    vertical: {
      direction: 'column',
    },
  } as TabListTokens);
