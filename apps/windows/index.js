'use strict';

import * as React from 'react';
import {AppRegistry} from 'react-native';
import {ThemeProvider} from '@uifabricshared/theming-react-native';
import {FabricTester, customRegistry} from '@fluentui-react-native/tester';

const FluentTester = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
