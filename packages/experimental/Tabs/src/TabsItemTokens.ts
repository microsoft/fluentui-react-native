import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { TabsItemTokens } from '.';

export const tabsItemStates: (keyof TabsItemTokens)[] = ['hovered', 'selected', 'focused', 'disabled', 'pressed'];

export const defaultTabsItemTokens: TokenSettings<TabsItemTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: 'green',
    color: t.colors.neutralForeground3Brand,
    borderColor: 'transparent',
    iconColor: t.colors.buttonIcon,
    indicatorColor: 'transparent',
    minHeight: 32,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 2,

    disabled: {
      backgroundColor: t.colors.buttonDisabledBackground,
      color: t.colors.neutralForegroundDisabled,
      borderColor: 'transparent',
      iconColor: t.colors.buttonDisabledIcon,
      indicatorColor: 'transparent',
    },
    hovered: {
      backgroundColor: t.colors.neutralForeground2Hover,
      iconColor: t.colors.buttonHoveredIcon,
      indicatorColor: t.colors.neutralStroke1,
    },
    pressed: {
      // backgroundColor: 'blue',
      color: t.colors.neutralForeground2Pressed,
      borderColor: t.colors.buttonPressedBorder,
      iconColor: t.colors.buttonPressedIcon,
      indicatorColor: t.colors.brandStroke1,
    },
    focused: {
      color: t.colors.neutralForeground1,
      borderColor: t.colors.neutralForeground1,
      icon: t.colors.buttonFocusedIcon,
      borderWidth: 2,
      borderRadius: 4,
      indicatorColor: t.colors.brandStroke1,
    },
    selected: {
      color: t.colors.neutralForeground1,
      icon: t.colors.buttonFocusedIcon,
      indicatorColor: t.colors.brandStroke1,
      borderColor: 'transparent',
      variant: 'bodySemibold',
      iconColor: t.colors.buttonDisabledIcon,
    },
  } as TabsItemTokens);
