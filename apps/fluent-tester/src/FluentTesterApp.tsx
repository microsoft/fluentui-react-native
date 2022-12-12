'use strict';

import { ThemeProvider } from '@fluentui-react-native/theme';
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

  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
