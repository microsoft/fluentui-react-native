import type { Theme } from '@fluentui-react-native/framework';
import { cornerRadius80, size80 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuListTokens } from './MenuList.types';

export const defaultMenuListTokens: TokenSettings<MenuListTokens, Theme> = (t: Theme): MenuListTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: cornerRadius80,
  paddingVertical: size80,
});
