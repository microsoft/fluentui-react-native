import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { TabsItemTokens } from '.';

export const tabsItemStates: (keyof TabsItemTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'selected'];

export const defaultTabsItemTokens: TokenSettings<TabsItemTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: 'green',
    color: t.colors.buttonText,
    borderColor: 'transparent',
    iconColor: t.colors.buttonIcon,
    indicatorColor: 'transparent',
    minHeight: 32,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 2,

    disabled: {
      backgroundColor: t.colors.buttonDisabledBackground,
      color: t.colors.buttonDisabledContent,
      borderColor: 'transparent',
      iconColor: t.colors.buttonDisabledIcon,
      indicatorColor: 'transparent',
    },
    hovered: {
      backgroundColor: t.colors.buttonHoveredBackground,
      color: t.colors.buttonHoveredContent,
      borderColor: t.colors.buttonHoveredBorder,
      iconColor: t.colors.buttonHoveredIcon,
      indicatorColor: 'lightgray',
    },
    pressed: {
      // backgroundColor: 'blue',
      color: t.colors.buttonPressedContent,
      borderColor: t.colors.buttonPressedBorder,
      iconColor: t.colors.buttonPressedIcon,
      indicatorColor: 'blue',
    },
    focused: {
      // backgroundColor: 'blue',
      color: t.colors.buttonFocusedContent,
      borderColor: t.colors.buttonFocusedBorder,
      icon: t.colors.buttonFocusedIcon,
      indicatorColor: 'blue',
    },
    selected: {
      // backgroundColor: 'blue',
      color: t.colors.buttonFocusedContent,
      borderColor: 'transparent',
      icon: t.colors.buttonFocusedIcon,
      indicatorColor: 'blue',
    },
  } as TabsItemTokens);
