import { buildUseTokens } from '@fluentui-react-native/framework';
import type { Theme } from '@fluentui-react-native/framework';
import { strokeWidth05 } from '@fluentui-react-native/design/tokens/global';

import type { DividerTokens } from './Divider.types';

export const useDividerTokens = buildUseTokens<DividerTokens>((theme: Theme) => ({
  // base tokens
  insetSize: 0,
  lineColor: theme.colors.neutralStroke2,
  thickness: strokeWidth05,
}));
