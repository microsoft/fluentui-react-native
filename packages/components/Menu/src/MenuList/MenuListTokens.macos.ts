import type { Theme } from '@fluentui-react-native/framework';
import { size20 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuListTokens } from './MenuList.types';

export const defaultMenuListTokens: TokenSettings<MenuListTokens, Theme> = (t: Theme): MenuListTokens => ({
  padding: 5, // hardcoded for now to match NSMenu
  backgroundColor: t.colors.transparentBackground,
  gap: size20,
});
