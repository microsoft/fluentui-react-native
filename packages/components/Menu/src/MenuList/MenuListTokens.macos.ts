import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuListTokens } from './MenuList.types';

export const defaultMenuListTokens: TokenSettings<MenuListTokens, Theme> = (t: Theme): MenuListTokens => ({
  padding: 5, // hardcoded for now to match ContextualMenu
  backgroundColor: t.colors.transparentBackground,
  gap: globalTokens.size20,
});
