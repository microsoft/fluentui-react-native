'use strict';

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { FabricTester } from './FabricTester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { customRegistry } from './CustomThemes';

const RNTesterApp: React.FunctionComponent<{}> =
() => {
    return (
      <ThemeProvider registry={customRegistry}>
        <FabricTester />
      </ThemeProvider>
    );
}

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export default RNTesterApp;
