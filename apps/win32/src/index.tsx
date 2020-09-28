'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
/* eslint-disable-next-line @typescript-eslint/camelcase */
import { AppRegistry, unstable_enableLogBox } from 'react-native';
import { windowsTests } from './WindowsTests';

// Remove this in RN 0.63 - this enables the new logbox experience which will be the default in RN 0.63.
unstable_enableLogBox();

const FluentTester: React.FunctionComponent<IFabricTesterProps> = (props) => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={windowsTests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
