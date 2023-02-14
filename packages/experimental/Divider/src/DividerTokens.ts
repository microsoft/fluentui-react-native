import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
import type { DividerTokens } from './Divider.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const useDividerTokens = buildUseTokens<DividerTokens>((theme: Theme) => ({
  // base tokens
  contentPadding: globalTokens.size120,
  flexAfter: 1,
  flexBefore: 1,
  insetSize: 0,
  lineColor: theme.colors.neutralStroke2,
  contentColor: theme.colors.neutralForeground2,
  minLineSize: globalTokens.size80,
  minWidth: 0,
  minHeight: 0,
  thickness: 1,
}));
