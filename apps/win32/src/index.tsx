'use strict';

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { FabricTester, IFabricTesterProps, customRegistry } from '@fluentui-react-native/tester';

const RNTesterApp: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export default RNTesterApp;
