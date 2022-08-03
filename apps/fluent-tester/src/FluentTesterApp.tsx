'use strict';

import { ThemeProvider } from '@fluentui-react-native/theme';
import * as React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { tests } from './testPages';
import { testerTheme } from './theme/index';

type SizeClassIOS = 'regular' | 'compact' | undefined;

/**
 * Hook that "guesses" our Size Class on iOS based on our window width
 * For more information about Size Classes, see teh following:
 * https://developer.apple.com/documentation/uikit/uitraitcollection
 * https://developer.apple.com/design/human-interface-guidelines/foundations/layout/#platform-considerations
 * @returns SizeClassIOS: enum determining our size class
 */
const useSizeClassIOS_DO_NOT_USE: () => SizeClassIOS = () => {
  const width = useWindowDimensions().width;
  if (Platform.OS === 'ios') {
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
  const isMobile = Platform.OS == 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

  // If on iPad we are presented in a Split View or Slide Over context, show the single pane view.
  const shouldShowSinglePane = isMobile || (!isMobile && sizeClass === 'compact');

  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enabledTests={tests} enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
