'use strict';

import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { customRegistry, registerThemes } from './CustomThemes';
import { tests } from './testPages';

registerThemes();

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  const [theme, setTheme] = React.useState('');
  return (
    <ThemeProvider registry={customRegistry} theme={theme}>
      <FluentTester theme={theme} setSelectedTheme={setTheme} enabledTests={tests} {...props} />
    </ThemeProvider>
  );
};
