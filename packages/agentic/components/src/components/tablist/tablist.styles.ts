import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import { getGapStyleValue } from '@fluentui-react-native/design/styling';

export type TabListThemeStyles = {
  root: ViewStyle;
};

const tabListThemeStylesKey = Symbol('TabList.themeStyles');

export function getTabListThemeStyles(themeState: ThemeState): TabListThemeStyles {
  const cachedStyles = themeState.themeStyles[tabListThemeStylesKey] as TabListThemeStyles | undefined;
  if (cachedStyles) {
    return cachedStyles;
  }

  const styles = StyleSheet.create<TabListThemeStyles>({
    root: {
      alignItems: 'flex-start',
      alignSelf: 'flex-start',
      gap: getGapStyleValue(themeState.tokens.spacing.componentBase100),
    },
  });

  themeState.themeStyles[tabListThemeStylesKey] = styles;
  return styles;
}

export const tabListStaticStyles = StyleSheet.create({
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
});
