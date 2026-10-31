'use strict';

import { AppRegistry, LogBox } from 'react-native';

import { FluentTesterApp } from '@fluentui-react-native/tester-core';

LogBox.ignoreLogs([/.*deprecated.*/, /.*Platform is not supported.*/]);

AppRegistry.registerComponent('FluentTester', () => FluentTesterApp);

export default FluentTesterApp;
