import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createDefaultTheme } from '@fluentui-react-native/design/theming/compat/defaults';
import { ThemeProvider } from '@fluentui-react-native/design/theming';
import type { ThemeReference } from '@fluentui-react-native/design/theming';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

type ThemeChoice = {
  label: string;
  theme?: ThemeReference;
};

const themeChoiceNames = ['none', 'light', 'dark', 'highContrast'] as const;
type ThemeChoiceName = (typeof themeChoiceNames)[number];

const themeChoices: Record<ThemeChoiceName, ThemeChoice> = {
  none: { label: 'No theme' },
  light: { label: 'Light', theme: createDefaultTheme({ appearance: 'light' }) },
  dark: { label: 'Dark', theme: createDefaultTheme({ appearance: 'dark' }) },
  highContrast: { label: 'High contrast', theme: createDefaultTheme({ appearance: 'highContrast' }) },
};

const StorybookThemeContext = React.createContext<ThemeReference | undefined>(undefined);

export function StorybookThemeHost({ children }: React.PropsWithChildren) {
  const [selectedName, setSelectedName] = React.useState<ThemeChoiceName>('none');
  const selectedTheme = themeChoices[selectedName].theme;
  const toolbarTestID = useDesktopStorybookTestID('theme-toolbar');
  const optionTestID = useDesktopStorybookTestID('theme');

  return (
    <StorybookThemeContext.Provider value={selectedTheme}>
      <View style={styles.root}>
        <View accessibilityRole="toolbar" style={styles.header} testID={toolbarTestID}>
          <Text style={styles.label}>Theme</Text>
          {themeChoiceNames.map((name) => {
            const choice = themeChoices[name];
            const selected = name === selectedName;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={name}
                onPress={() => setSelectedName(name)}
                style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && styles.pressedOption]}
                testID={`${optionTestID}-${name}`}
              >
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{choice.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.storybook}>{children}</View>
      </View>
    </StorybookThemeContext.Provider>
  );
}

export function StorybookThemeProvider({ children }: React.PropsWithChildren) {
  const theme = React.useContext(StorybookThemeContext);
  return theme ? <ThemeProvider theme={theme}>{children}</ThemeProvider> : children;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderBottomColor: '#d1d1d1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    color: '#242424',
    fontSize: 14,
    fontWeight: '600',
    marginEnd: 4,
  },
  option: {
    backgroundColor: '#ffffff',
    borderColor: '#b3b3b3',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#0f6cbd',
    borderColor: '#0f6cbd',
  },
  pressedOption: {
    opacity: 0.75,
  },
  optionText: {
    color: '#242424',
    fontSize: 12,
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  storybook: {
    flex: 1,
  },
});
