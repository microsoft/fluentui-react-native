'use strict';

import { ThemeProvider } from '@fluentui-react-native/theme';
import * as React from 'react';
import { Platform } from 'react-native';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { tests } from './testPages';
import { testerTheme } from './theme/index';
import { useSizeClassIOS } from '@fluentui-react-native/interactive-hooks';

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  const sizeClass = useSizeClassIOS();
  const isMobile = Platform.OS == 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

  // If on iPad we are presented in a Split View or Slide Over context, show the single pane view.
  const shouldShowSinglePane = isMobile || (!isMobile && sizeClass === 'compact');

  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enabledTests={tests} enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
