'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry } from 'react-native';
import { webTests } from './WebTests';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester enabledTests={webTests} {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

AppRegistry.runApplication("FluentTester", { rootTag: document.getElementById("FluentTester") });

export default FluentTester;
