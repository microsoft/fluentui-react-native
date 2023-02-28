import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabsItemTokens } from '.';

export const tabsItemStates: (keyof TabsItemTokens)[] = ['hovered', 'selected', 'disabled'];

export const defaultTabsItemTokens: TokenSettings<TabsItemTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.buttonText,
    borderColor: 'transparent',
    indicatorColor: 'transparent',
    variant: 'heroStandard',
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 4,
    indicatorMarginHorizontal: 10,
    tabsItemOpacity: 0.6,
    disabled: {
      tabsItemOpacity: 0.2,
    },
    hovered: {
      tabsItemOpacity: 0.8,
    },
    selected: {
      indicatorColor: t.colors.brandStroke1,
      tabsItemOpacity: 1,
    },
  } as TabsItemTokens);
