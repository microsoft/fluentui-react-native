import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabsTokens } from '.';

export const defaultTabsTokens: TokenSettings<TabsTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.transparent,
    color: t.colors.buttonText,
    variant: 'subheaderSemibold',
    borderColor: t.colors.buttonBorder,
    iconColor: t.colors.iconColor,
  } as TabsTokens);
