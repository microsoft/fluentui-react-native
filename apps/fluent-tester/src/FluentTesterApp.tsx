'use strict';

import { createAndroidTheme } from '@fluentui-react-native/android-theme';
import { ThemeReference, ThemeProvider } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/framework';
import * as React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { testerTheme } from './theme/index';

type SizeClassIOS = 'regular' | 'compact' | undefined;

/**
 * Hook that "guesses" our Size Class on iOS based on our window width.
 * Note: this is hacky and should not be used.
 *
 * For more information about Size Classes, see the following:
 * https://developer.apple.com/documentation/uikit/uitraitcollection
 * https://developer.apple.com/design/human-interface-guidelines/foundations/layout/#platform-considerations
 * @returns SizeClassIOS: enum determining our size class
 */
const useSizeClassIOS_DO_NOT_USE: () => SizeClassIOS = () => {
  if (Platform.OS === 'ios') {
    /**
     * Technically this violates the rules of hooks (calling hooks inside conditions) but Platform.OS checks are pretty non-conditional.
     * This is necessary because useWindowDimensions() does not work in win32.
     */
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const width = useWindowDimensions().width;
    if (Platform.isPad && width > 375) {
      return 'regular';
    } else {
      return 'compact';
    }
  } else {
    return undefined;
  }
};

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  const sizeClass = useSizeClassIOS_DO_NOT_USE();
  const isMobile = Platform.OS === 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

  // If on iPad we are presented in a Split View or Slide Over context, show the single pane view.
  const shouldShowSinglePane = isMobile || (!isMobile && sizeClass === 'compact');
  // ankraj - create a custom theme here. Try using the themeRecipes in it.
// Is there still the need for brand API thing to simplify overriding brand tokens?
// There seems 2 parts of the sceanrios here - new colors, and exisitng brand  colors.
git branch --sho
  const theme = new ThemeReference(
  createAndroidTheme(),
  () => {
  return {{ colors: { buttonBackground: 'red' }}}}, // overrides the buttonBackground color token, all other colors are kept in tact
  (theme: Theme) => {
    return {
      { colors: { neutralBackground1: theme.colors.buttonBackground }}, // This is now red, because theme has previous recipe applied. This also addded a new color in
                                                                          // theme.color.
      { spacing: s1: '10px' }
    }},
  // other recipes
);

  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
