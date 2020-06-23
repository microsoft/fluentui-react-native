'use strict';

// This is an unstable replacement for Yellow Box
require('react-native').unstable_enableLogBox();

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { FabricTester, IFabricTesterProps, customRegistry } from '@fluentui-react-native/tester';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = (props) => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
