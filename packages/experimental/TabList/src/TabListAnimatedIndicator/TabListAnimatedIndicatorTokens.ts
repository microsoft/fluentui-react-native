import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabListAnimatedIndicatorTokens } from './TabListAnimatedIndicator.types';

export const tabListAnimatedIndicatorStates: (keyof TabListAnimatedIndicatorTokens)[] = ['vertical', 'hovered', 'pressed', 'disabled'];

export const defaultTabListAnimatedIndicatorTokens: TokenSettings<TabListAnimatedIndicatorTokens, Theme> = (theme: Theme) =>
  ({
    color: theme.colors.compoundBrandStroke1,
    bottom: 0,
    vertical: {
      start: 0,
    },
  } as TabListAnimatedIndicatorTokens);
