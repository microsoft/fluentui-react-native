import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeThemeRegistry } from '@uifabricshared/theming-react-native/src/Global';
import { ThemeProvider } from '@uifabricshared/theming-react-native';
import { useTheme } from '@uifabricshared/theming-react-native';

const customThemeRegistry = createNativeThemeRegistry();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <ThemeProvider themeRegistry={customThemeRegistry}>
        <ThemeProviderPanel>
          <Text>Theme Provider text!</Text>
        </ThemeProviderPanel>
      </ThemeProvider>
    </View>
  );
}

const ThemeProviderPanel: ReactFunctionComponent<ViewProps> = (props: ViewProps) => {
  const { style, ...rest } = props;
  const theme = useTheme();
  return <View {...rest} style={[{ backgroundColor: theme.palette.bodyBackground }, style]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
