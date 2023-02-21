import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
import type { DividerTokens } from './Divider.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const useDividerTokens = buildUseTokens<DividerTokens>((theme: Theme) => ({
  // base tokens
  insetSize: 0,
  lineColor: theme.colors.neutralStroke2,
  thickness: globalTokens.stroke.width05,
}));
