'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native';
import { windowsTests } from './WindowsTests';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={windowsTests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
