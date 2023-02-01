import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuListTokens } from './MenuList.types';

export const defaultMenuListTokens: TokenSettings<MenuListTokens, Theme> = (t: Theme): MenuListTokens => ({
  paddingVertical: globalTokens.size40,
  minWidth: 160,
  maxWidth: 300,
  backgroundColor: t.colors.neutralBackground1,
  hasMaxHeight: {
    minWidth: 175,
  },
});
