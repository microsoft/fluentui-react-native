import { AppRegistry, LogBox } from 'react-native';
import StorybookApp from './src/StorybookApp';
import { name as appName } from './app.json';

LogBox.ignoreLogs([
  // The supported React Native peer floor predates the public root codegen exports.
  /^Deep imports from the 'react-native' package are deprecated \('react-native\/Libraries\/Utilities\/codegenNative(?:Commands|Component)'\)\./,
  // Storybook's sidebar expands its LegendList pool on demand without affecting rendering.
  '[legend-list] No unused container available, so creating one on demand.',
]);

AppRegistry.registerComponent(appName, () => StorybookApp);
