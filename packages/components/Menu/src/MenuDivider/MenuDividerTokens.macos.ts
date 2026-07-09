import type { Theme } from '@fluentui-react-native/framework';
import { size40, strokeWidth10 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuDividerTokens } from './MenuDivider.types';

export const defaultMenuDividerTokens: TokenSettings<MenuDividerTokens, Theme> = (t: Theme): MenuDividerTokens => ({
  backgroundColor: t.colors.neutralStroke2,
  height: strokeWidth10,
  margin: size40,
});
