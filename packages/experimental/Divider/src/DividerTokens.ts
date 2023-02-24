import { buildUseTokens } from '@fluentui-react-native/framework';
import type { DividerTokens } from './Divider.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const useDividerTokens = buildUseTokens<DividerTokens>(() => ({
  // base tokens
  contentPadding: globalTokens.size120,
  flexAfter: 1,
  flexBefore: 1,
  insetSize: 0,
  minLineSize: globalTokens.size80,
  minWidth: 0,
  minHeight: 0,
  textVariant: 'secondaryStandard',
  thickness: 1,
}));
