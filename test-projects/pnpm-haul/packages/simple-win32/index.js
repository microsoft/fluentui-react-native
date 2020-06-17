'use strict';

const React = require('react');
const { AppRegistry, View } = require('react-native');
const { ThemeProvider, createPlatformThemeRegistry } = require('@uifabricshared/theming-react-native');
const { Text, Button } = require('@fluentui/react-native');

const registry = createPlatformThemeRegistry('TaskPane');

const BasicWin32Test = props => (
  <ThemeProvider registry={registry}>
    <View>
      <Text>Here is some text</Text>
      <Button content="Here is a button" />
    </View>
  </ThemeProvider>
);

AppRegistry.registerComponent('BasicWin32Test', () => BasicWin32Test);

export default BasicWin32Test;
