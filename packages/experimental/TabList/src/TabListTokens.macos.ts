import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabListTokens } from '.';

export const defaultTabListTokens: TokenSettings<TabListTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.menuItemText,
    variant: 'bodySemibold',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: t.colors.transparent,
    borderColor: t.colors.buttonBorder,
    iconColor: t.colors.iconColor,
  } as TabListTokens);
