'use strict';

import { ThemeProvider } from '@fluentui-react-native/theme';
import * as React from 'react';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { tests } from './testPages';
import { testerTheme } from './theme/index';

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  // const [theme, setTheme] = React.useState('');
  return (
    <ThemeProvider theme={testerTheme}>
      <FluentTester enabledTests={tests} {...props} />
    </ThemeProvider>
  );
};
