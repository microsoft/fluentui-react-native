'use strict';

import { useHorizontalSizeClass } from '@fluentui-react-native/experimental-appearance-additions';
import { ThemeProvider } from '@fluentui-react-native/theme';
import * as React from 'react';
import { Platform } from 'react-native';

import type { FluentTesterProps } from './FluentTester';
import { FluentTester } from './FluentTester';
import { testerTheme } from './theme/index';

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  const sizeClass = useHorizontalSizeClass();
  const isMobile = Platform.OS === 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

  // If on iPad we are presented in a Split View or Slide Over context, show the single pane view.
  const shouldShowSinglePane = isMobile || (!isMobile && sizeClass === 'compact');

  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enableSinglePaneView={shouldShowSinglePane} {...props} />
    </ThemeProvider>
  );
};
