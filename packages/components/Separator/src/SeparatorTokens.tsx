import type { Theme } from '@fluentui-react-native/framework';
import { strokeWidth10 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SeparatorTokens } from './Separator.types';

export const defaultSeparatorTokens: TokenSettings<SeparatorTokens, Theme> = () =>
  ({
    separatorWidth: strokeWidth10,
  }) as SeparatorTokens;
