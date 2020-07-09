'use strict';

import { customRegistry, FabricTester } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native';
import { allPlatformTests } from '../tests/AllPlatformTests';

const FluentTester = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={allPlatformTests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
