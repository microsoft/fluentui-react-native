import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { PlatformColor } from 'react-native';
import { MenuDividerTokens } from './MenuDivider.types';

export const defaultMenuDividerTokens: TokenSettings<MenuDividerTokens, Theme> = (t: Theme): MenuDividerTokens => ({
  backgroundColor: PlatformColor('separatorColor'), // hardcoded for now
  height: globalTokens.stroke.width.thin,
  margin: globalTokens.spacing.xxs,
});
