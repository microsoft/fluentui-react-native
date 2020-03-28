'use strict';

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { FabricTester, IFabricTesterProps } from './FabricTester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { customRegistry } from './CustomThemes';

const RNTesterApp: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export default RNTesterApp;
