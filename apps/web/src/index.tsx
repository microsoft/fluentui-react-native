// 'use strict';

// import { customRegistry, FabricTester, IFabricTesterProps } from '@fluentui-react-native/tester';
// import { ThemeProvider } from '@uifabricshared/theming-react-native';
// import * as React from 'react';
// import { AppRegistry } from 'react-native';

// const FluentTester: React.FunctionComponent<IFabricTesterProps> = props => {
//   return (
//     <ThemeProvider registry={customRegistry}>
//       <FabricTester {...props} />
//     </ThemeProvider>
//   );
// };

// AppRegistry.registerComponent('FluentTester', () => FluentTester);

// export default FluentTester;

import { AppRegistry } from 'react-native';
import App from './App';

// Register app
AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  initialProp: {},
  rootTag: document.getElementById('root')
});