'use strict';

import { FluentTesterApp } from '@fluentui-react-native/tester';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('FluentTester', () => FluentTesterApp);

AppRegistry.runApplication('FluentTester', { rootTag: document.getElementById('FluentTester') });

export default FluentTesterApp;
