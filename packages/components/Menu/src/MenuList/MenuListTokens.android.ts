import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuListTokens } from './MenuList.types';

export const defaultMenuListTokens: TokenSettings<MenuListTokens, Theme> = (t: Theme): MenuListTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  cornerRadius: 8,
});
