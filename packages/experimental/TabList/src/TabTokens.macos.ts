import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabTokens } from './Tab.types';

export const tabStates: (keyof TabTokens)[] = ['hovered', 'selected', 'focused', 'disabled'];

export const defaultTabTokens: TokenSettings<TabTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.bodyText,
    variant: 'bodyStandard',
    indicatorColor: 'transparent',
    borderColor: 'transparent',
    indicatorMarginHorizontal: 10,
    iconColor: t.colors.buttonIcon,
    disabled: {
      color: t.colors.buttonTextDisabled,
      indicatorColor: 'transparent',
      fontWeight: 'normal',
    },
    hovered: {
      fontWeight: 'bold',
      selected: {
        indicatorMarginHorizontal: 0,
      },
    },
    selected: {
      icon: t.colors.buttonFocusedIcon,
      indicatorColor: t.colors.accentButtonBackground,
      fontWeight: 'bold',
    },
  } as TabTokens);
