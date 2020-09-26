'use strict';

import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { FluentTester, FluentTesterProps } from './FluentTester';
import { customRegistry, registerThemes } from './CustomThemes';
import { tests } from './testPages';

registerThemes();

export const FluentTesterApp: React.FunctionComponent<FluentTesterProps> = (props) => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FluentTester enabledTests={tests} {...props} />
    </ThemeProvider>
  );
};
