import { Theme, buildUseTokens } from '@fluentui-react-native/framework';
// import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { DividerTokens } from './Divider.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const useDividerTokens = buildUseTokens<DividerTokens>((theme: Theme) => ({
  // base tokens
  contentPadding: globalTokens.size80,
  flexAfter: 1,
  flexBefore: 1,
  insetSize: 0,
  lineColor: theme.colors.neutralStroke2,
  contentColor: theme.colors.neutralForeground2,
  minWidth: 0,
  minHeight: 0,
  thickness: 1,
}));
