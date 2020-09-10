'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry, SafeAreaView } from 'react-native';
import { androidTests } from './androidTests';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <SafeAreaView>
      <ThemeProvider registry={customRegistry}>
        <FabricTester enabledTests={androidTests} {...props} />
      </ThemeProvider>
    </SafeAreaView>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
