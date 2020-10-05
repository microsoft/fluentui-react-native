'use strict';

import { FluentTesterApp } from '@fluentui-react-native/tester';
/* eslint-disable-next-line @typescript-eslint/camelcase */
import { AppRegistry, unstable_enableLogBox } from 'react-native';

// Remove this in RN 0.63 - this enables the new logbox experience which will be the default in RN 0.63.
unstable_enableLogBox();

AppRegistry.registerComponent('FluentTester', () => FluentTesterApp);

export default FluentTesterApp;
