'use strict';

import { ThemeProvider } from '@fluentui-react-native/theme';
import * as React from 'react';
import { Platform } from 'react-native';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { tests } from './testPages';
import { testerTheme } from './theme/index';

const isMobile = Platform.OS == 'android' || (Platform.OS === 'ios' && Platform.isPad === false);

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enabledTests={tests} enableSinglePaneView={isMobile} {...props} />
    </ThemeProvider>
  );
};
