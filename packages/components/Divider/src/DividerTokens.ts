import { buildUseTokens } from '@fluentui-react-native/framework';
import { size120, size80 } from '@fluentui-react-native/design/tokens/global';

import type { DividerTokens } from './Divider.types';

export const useDividerTokens = buildUseTokens<DividerTokens>(() => ({
  // base tokens
  contentPadding: size120,
  flexAfter: 1,
  flexBefore: 1,
  minLineSize: size80,
  minWidth: 0,
  thickness: 1,
}));
