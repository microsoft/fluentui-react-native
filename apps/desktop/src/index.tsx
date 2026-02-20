import { AppRegistry, LogBox } from 'react-native';

import { FluentTesterApp as DesktopTester } from '@fluentui-react-native/tester-core';

// When selecting a test page, the test page button might be under the yellowbox,
//so we have to ensure that no yellowboxes are shown on boot that could affect test selection
LogBox.ignoreLogs([/.*deprecated.*/, /.*Platform is not supported.*/]);

AppRegistry.registerComponent('DesktopTester', () => DesktopTester);

export default DesktopTester;
