import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuDividerTokens } from './MenuDivider.types';

export const defaultMenuDividerTokens: TokenSettings<MenuDividerTokens, Theme> = (t: Theme): MenuDividerTokens => ({
  backgroundColor: t.colors.neutralStroke1,
  height: globalTokens.stroke.width10,
  margin: globalTokens.size20,
});
