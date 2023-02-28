import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuDividerTokens } from './MenuDivider.types';

export const defaultMenuDividerTokens: TokenSettings<MenuDividerTokens, Theme> = (t: Theme): MenuDividerTokens => ({
  backgroundColor: t.colors.neutralStroke2,
  height: globalTokens.stroke.width10,
  margin: globalTokens.size40,
});
