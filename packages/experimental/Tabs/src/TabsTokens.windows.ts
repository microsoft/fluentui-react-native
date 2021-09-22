import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { TabsTokens } from '.';

export const defaultTabsTokens: TokenSettings<TabsTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.transparent,
    color: t.colors.menuItemText,
    variant: 'bodySemibold',
    fontWeight: 'bold',
    fontSize: 14,
    borderColor: t.colors.buttonBorder,
    iconColor: t.colors.iconColor,
  } as TabsTokens);
