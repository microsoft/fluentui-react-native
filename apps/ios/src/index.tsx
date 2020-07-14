'use strict';

import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import * as React from 'react';
import { AppRegistry, SafeAreaView } from 'react-native';
import { iosTests } from './IOSTests';

const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
  return (
    <SafeAreaView>
      <ThemeProvider registry={customRegistry}>
        <FabricTester enabledTests={iosTests} {...props} />
      </ThemeProvider>
    </SafeAreaView>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
