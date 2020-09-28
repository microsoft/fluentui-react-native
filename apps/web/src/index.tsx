'use strict';

import { FluentTesterApp } from '@fluentui-react-native/tester';
import * as React from 'react';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('FluentTester', () => FluentTesterApp);

AppRegistry.runApplication('FluentTester', { rootTag: document.getElementById('FluentTester') });

export default FluentTester;
