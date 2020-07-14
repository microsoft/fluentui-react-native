'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native-macos';
import { macTests } from './MacTests';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={macTests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
