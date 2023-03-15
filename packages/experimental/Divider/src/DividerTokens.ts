import { buildUseTokens } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { DividerTokens } from './Divider.types';

export const useDividerTokens = buildUseTokens<DividerTokens>(() => ({
  // base tokens
  contentPadding: globalTokens.size120,
  flexAfter: 1,
  flexBefore: 1,
  minLineSize: globalTokens.size80,
  minWidth: 0,
  thickness: 1,
}));
