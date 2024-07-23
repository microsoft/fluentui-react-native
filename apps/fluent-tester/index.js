'use strict';

import { AppRegistry, LogBox } from 'react-native';

import { FluentTesterApp } from './src/FluentTesterApp';

// When selecting a test page, the test page button might be under the yellowbox,
//so we have to ensure that no yellowboxes are shown on boot that could affect test selection
LogBox.ignoreLogs([/.*deprecated.*/, /.*Platform is not supported.*/])

AppRegistry.registerComponent('FluentTester', () => FluentTesterApp);

export default FluentTesterApp;
