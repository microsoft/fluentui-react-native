import React from 'react';
import { StyleSheet, Text, View, ViewProps, TextProps } from 'react-native';
import {
  ThemeLayer,
  setTheme,
  augmentPlatformTheme,
  ThemingModuleHelper,
  ThemeContext,
  INativeTheme
} from '@uifabricshared/theming-react-native';

ThemingModuleHelper.addListener(() => {
  augmentPlatformTheme(ThemingModuleHelper.getPlatformTheme());
});
// Default Theme
setTheme({});
// Using a platform-provided Theme Definition
setTheme(ThemingModuleHelper.getPlatformThemeDefinition('TaskPane'), 'PlatformTaskPane');

const ButtonBackground: React.FunctionComponent<TextProps> = (p: ViewProps) => {
  const theme = React.useContext(ThemeContext);
  const { style, ...rest } = p;
  return <View {...rest} style={[style, { backgroundColor: theme.colors.primaryButtonBackground }]} />;
};

const ButtonText: React.FunctionComponent<TextProps> = (p: TextProps) => {
  const theme = React.useContext(ThemeContext);
  const { style, ...rest } = p;
  return <Text {...rest} style={[style, { color: theme.colors.primaryButtonText }]} />;
};

const PanelWithButton: React.FunctionComponent<{ themeName?: string }> = (p: { themeName: string }) => {
  return (
    <ThemeLayer {...p}>
      {(theme: INativeTheme) => {
        const bgColor = theme.colors.background;
        return (
          <View style={[{ backgroundColor: bgColor, height: 50 }]}>
            <ButtonBackground>
              <ButtonText>{'BackgroundColor' + JSON.stringify(bgColor)}</ButtonText>
            </ButtonBackground>
          </View>
        );
      }}
    </ThemeLayer>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <PanelWithButton />
      <PanelWithButton themeName="PlatformTaskPane" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
