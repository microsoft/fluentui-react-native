'use strict';

import {AppRegistry} from 'react-native';
import {ThemeProvider} from '@uifabricshared/theming-react-native';
import {FabricTester, customRegistry} from '@fluentui-react-native/tester';

const RNTesterApp = (props) => {
  return (
    <ThemeProvider registry={customRegistry}>
      <FabricTester {...props} />
    </ThemeProvider>
  );
};

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

export default RNTesterApp;
