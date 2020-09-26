'use strict';

import {FluentTesterApp} from '@fluentui-react-native/tester';
import * as React from 'react';
import {AppRegistry, SafeAreaView} from 'react-native';

const FluentTester: React.FunctionComponent = () => {
  return (
    <SafeAreaView>
      <FluentTesterApp />
    </SafeAreaView>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
