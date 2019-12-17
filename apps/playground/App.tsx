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
  IPartialTheme
} from '@uifabricshared/theming-react-native';
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
  components: {
    Button: {
      tokens: {
        borderWidth: 0,
        backgroundColor: '#ffcd11',
        color: '#000'
      },
      _overrides: {
        hovered: {
          tokens: {
            backgroundColor: '#111',
            color: '#fff'
          }
        },
        pressed: {
          tokens: {
            backgroundColor: '#eee',
            color: '#111'
          }
        }
      }
    }
  }
};

const mockThemingModuleHelper = createMockThemingModuleHelper(mockThemingModule, emitter);

const customThemeRegistry = createPlatformThemeRegistry('TaskPane', mockThemingModuleHelper);
// default theme
customThemeRegistry.setTheme(caterpillarTheme);
customThemeRegistry.setTheme(ThemingModuleHelper.getPlatformThemeDefinition('WhiteColors'), 'PlatformWhiteColors');

const ThemeSwitcher: React.FunctionComponent = (_p: {}) => {
  const switchTheme = React.useCallback(() => {
    useWhiteColors = !useWhiteColors;
    emitter.emit('onPlatformDefaultsChanged');
  }, []);
  return (
    <TouchableOpacity onPress={switchTheme} style={styles.themeSwitcher}>
      <Text>Switch Theme</Text>
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
          <ThemeSwitcher />
        </View>
        <ThemeProvider theme="PlatformWhiteColors">
          <ThemedPanel style={styles.container}>
            <ThemedText>Theme Provider text!</ThemedText>
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
  },
  themeSwitcher: {
    backgroundColor: 'gray'
  }
});
