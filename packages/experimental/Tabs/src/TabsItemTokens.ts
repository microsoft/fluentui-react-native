import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { TabsItemTokens } from '.';

export const tabsItemStates: (keyof TabsItemTokens)[] = ['hovered', 'selected', 'focused', 'disabled', 'pressed'];

export const defaultTabsItemTokens: TokenSettings<TabsItemTokens, Theme> = (t: Theme) =>
  ({
    color: t.colors.neutralStrokeAccessible,
    borderColor: 'transparent',
    indicatorColor: 'transparent',
    variant: 'bodyStandard',
    borderWidth: 2,
    borderRadius: 4,
    indicatorMarginHorizontal: 10,
    disabled: {
      color: t.colors.neutralForegroundDisabled,
      borderColor: 'transparent',
      indicatorColor: 'transparent',
    },
    hovered: {
      color: t.colors.neutralForeground1,
      indicatorColor: t.colors.neutralStroke1,
      selected: {
        indicatorMarginHorizontal: 0,
      },
    },
    pressed: {
      color: t.colors.neutralForeground2Pressed,
      indicatorColor: t.colors.brandStroke1,
    },
    focused: {
      color: t.colors.neutralForeground1,
      borderColor: t.colors.neutralForeground1,
      icon: t.colors.buttonFocusedIcon,
    },
    selected: {
      color: t.colors.neutralForeground1,
      icon: t.colors.buttonFocusedIcon,
      indicatorColor: t.colors.brandStroke1,
      variant: 'bodySemibold',
    },
  } as TabsItemTokens);
