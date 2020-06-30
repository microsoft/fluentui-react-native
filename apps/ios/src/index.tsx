'use strict';

import * as React from 'react';
import { AppRegistry, SafeAreaView } from 'react-native';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { FabricTester, IFabricTesterProps, customRegistry } from '@fluentui-react-native/tester';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <SafeAreaView>
      <ThemeProvider registry={customRegistry}>
        <FabricTester {...props} />
      </ThemeProvider>
    </SafeAreaView>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
