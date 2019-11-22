import React from 'react';
import { StyleSheet, Text, View, ViewProps, TextProps, NativeEventEmitter, TouchableOpacity } from 'react-native';
import {
  ThemingModuleHelper,
  ThemeProvider,
  createPlatformThemeRegistry,
  useTheme,
  createMockThemingModule,
  createMockThemingModuleHelper,
  mockGetPaletteImpl,
  ITheme
} from '@uifabricshared/theming-react-native';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';

let useWhiteColors = true;
const emitter = new NativeEventEmitter();
const mockThemingModule = createMockThemingModule({
  getPalette: (_pal?: string) => {
    return mockGetPaletteImpl(useWhiteColors ? 'WhiteColors' : 'TaskPane');
  }
});

const mockThemingModuleHelper = createMockThemingModuleHelper(mockThemingModule, emitter);

const customThemeRegistry = createPlatformThemeRegistry('TaskPane', mockThemingModuleHelper);
// default theme
customThemeRegistry.setTheme({});
customThemeRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'PlatformWhiteColors');

const primaryButtonStyles = themedStyleSheet((t: ITheme) => {
  return {
    textStyle: {
      color: t.colors.primaryButtonText
    }
  };
});

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

const ThemeSwitcher: React.FunctionComponent = (_p: {}) => {
  const switchTheme = React.useCallback(() => {
    useWhiteColors = !useWhiteColors;
    emitter.emit('onPlatformDefaultsChanged');
  }, []);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={switchTheme}>
      <ButtonBackground>
        <ButtonText>Switch Theme!</ButtonText>
      </ButtonBackground>
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <ThemeProvider registry={customThemeRegistry}>
      <ThemedPanel style={styles.root}>
        <View style={styles.container}>
          <ThemedText>Open up App.tsx to start working on your app!</ThemedText>
          <ButtonBackground>
            <ButtonText>Fake Primary Button</ButtonText>
          </ButtonBackground>
          <ThemeSwitcher />
        </View>
        <ThemeProvider theme="PlatformWhiteColors">
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
