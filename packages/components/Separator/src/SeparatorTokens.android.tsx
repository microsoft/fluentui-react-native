import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SeparatorTokens } from './Separator.types';

export const defaultSeparatorTokens: TokenSettings<SeparatorTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.neutralStroke2,
    separatorWidth: globalTokens.stroke.width10,
    insetSpacing: 0,
  }) as SeparatorTokens;
