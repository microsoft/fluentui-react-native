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
import { Button } from './components';

let useWhiteColors = true;
const emitter = new NativeEventEmitter();
const mockThemingModule = createMockThemingModule({
  getPalette: (_pal?: string) => {
    return mockGetPaletteImpl(useWhiteColors ? 'WhiteColors' : 'TaskPane');
  }
});

// const msgq = require('MessageQueue');
// msgq.spy(true);

const caterpillarTheme: IPartialTheme = {
  colors: {
    buttonBackground: '#ffcd11',
    buttonBackgroundHovered: '#111',
    buttonBackgroundPressed: '#eee',
    buttonText: '#000',
    buttonTextPressed: '#111',
    buttonTextHovered: '#fff'
  }
};

const mockThemingModuleHelper = createMockThemingModuleHelper(mockThemingModule, emitter);

const customThemeRegistry = createPlatformThemeRegistry('TaskPane', mockThemingModuleHelper);
// default theme
customThemeRegistry.setTheme(caterpillarTheme, 'cat');
customThemeRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'PlatformWhiteColors');

const getPrimaryButtonStyles = themedStyleSheet((t: ITheme) => {
  return {
    textStyle: {
      color: t.colors.primaryButtonText
    },
    backgroundStyle: {
      backgroundColor: t.colors.primaryButtonBackground,
      borderColor: t.colors.primaryButtonBorder
    }
  };
});

const ButtonBackground: React.FunctionComponent<ViewProps> = (p: ViewProps) => {
  const theme = useTheme();
  const styles = getPrimaryButtonStyles(theme);
  const { style, ...rest } = p;
  return <View {...rest} style={[styles.backgroundStyle, style]} />;
};

const ButtonText: React.FunctionComponent<TextProps> = (p: TextProps) => {
  const theme = useTheme();
  const styles = getPrimaryButtonStyles(theme);
  const { style, ...rest } = p;
  return <Text {...rest} style={[styles.textStyle, style]} />;
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
          <Button content="Hello Android Button" />
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
    alignItems: 'stretch',
    justifyContent: 'space-evenly'
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500
  }
});
