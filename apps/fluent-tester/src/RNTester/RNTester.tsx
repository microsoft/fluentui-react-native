'use strict';

import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native';
import { FabricTester, IFabricTesterProps } from './FabricTester';
import { customRegistry } from './TestComponents/Theme/CustomThemes';
import { Tests } from './Tests';

const RNTesterApp: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={Tests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export default RNTesterApp;
