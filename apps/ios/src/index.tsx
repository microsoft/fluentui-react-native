'use strict';

import {FluentTesterApp} from '@fluentui-react-native/tester';
import * as React from 'react';
import {AppRegistry, SafeAreaView, Text, useColorScheme} from 'react-native';

const FluentTester: React.FunctionComponent = () => {
  const isDarkMode = useColorScheme && useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
    flexGrow: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <FluentTesterApp />
    </SafeAreaView>
  );
};

AppRegistry.registerComponent('FluentTester', () => FluentTester);

export default FluentTester;
