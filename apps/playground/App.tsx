import React from 'react';
import { StyleSheet, Text, View, ViewProps, TextProps, Button } from 'react-native';
import {
  ThemeLayer,
  ThemingModuleHelper,
  ThemeContext,
  INativeTheme,
  ThemeProvider,
  createPlatformThemeRegistry,
  useTheme
} from '@uifabricshared/theming-react-native';

const customThemeRegistry = createPlatformThemeRegistry('TaskPane');
// default theme
customThemeRegistry.setTheme({});
customThemeRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'PlatformWhiteColors');

const ButtonBackground: React.FunctionComponent<ViewProps> = (p: ViewProps) => {
  const theme = useTheme();
  const { style, ...rest } = p;
  return <View {...rest} style={[{ backgroundColor: String(theme.colors.primaryButtonBackground) }, style]} />;
};

const ButtonText: React.FunctionComponent<TextProps> = (p: TextProps) => {
  const theme = useTheme();
  const { style, ...rest } = p;
  return <Text {...rest} style={[{ color: String(theme.colors.primaryButtonText) }, style]} />;
};

export default function App() {
  return (
    <ThemeProvider themeRegistry={customThemeRegistry}>
      <ThemedPanel style={styles.root}>
        <View style={styles.container}>
          <ThemedText>Open up App.tsx to start working on your app!</ThemedText>
          <ButtonBackground>
            <ButtonText>Fake Primary Button</ButtonText>
          </ButtonBackground>
        </View>
        <ThemeProvider themeName="PlatformWhiteColors">
          <ThemedPanel style={styles.container}>
            <ThemedText>Theme Provider text!</ThemedText>
            <ButtonBackground>
              <ButtonText>Fake Primary Button</ButtonText>
            </ButtonBackground>
          </ThemedPanel>
        </ThemeProvider>
      </ThemedPanel>
    </ThemeProvider>
  );
}

const ThemedPanel: React.FunctionComponent<ViewProps> = (props: ViewProps) => {
  const { style, ...rest } = props;
  const theme = useTheme();
  return <View {...rest} style={[{ backgroundColor: theme.colors.background }, style]} />;
};

const ThemedText: React.FunctionComponent<TextProps> = (p: TextProps) => {
  const theme = useTheme();
  const { style, ...rest } = p;
  return <Text {...rest} style={[{ color: String(theme.colors.bodyText) }, style]} />;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-evenly'
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500
  }
});
