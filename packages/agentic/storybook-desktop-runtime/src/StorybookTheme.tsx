import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { ThemedRoot, themedStyleSheetFactory, useThemeState } from '@fluentui-react-native/design';
import type { ThemeReference } from '@fluentui-react-native/design/theming';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

type ThemeChoice = {
  label: string;
  theme?: ThemeReference;
};

const themeChoiceNames = ['none', 'light', 'dark', 'highContrast'] as const;
type ThemeChoiceName = (typeof themeChoiceNames)[number];

const themeChoices: Record<ThemeChoiceName, ThemeChoice> = {
  none: { label: 'Default Flex' },
  light: { label: 'Light', theme: createDefaultTheme({ appearance: 'light' }) },
  dark: { label: 'Dark', theme: createDefaultTheme({ appearance: 'dark' }) },
  highContrast: { label: 'High contrast', theme: createDefaultTheme({ appearance: 'highContrast' }) },
};

export function StorybookThemeHost({ children }: React.PropsWithChildren) {
  const [selectedName, setSelectedName] = React.useState<ThemeChoiceName>('none');
  const testID = useDesktopStorybookTestID('app-root');

  return (
    <ThemedRoot style={layoutStyles.root} testID={testID} theme={themeChoices[selectedName].theme}>
      <StorybookThemeContent selectedName={selectedName} onSelect={setSelectedName}>
        {children}
      </StorybookThemeContent>
    </ThemedRoot>
  );
}

function StorybookThemeContent({
  children,
  selectedName,
  onSelect,
}: React.PropsWithChildren<{ selectedName: ThemeChoiceName; onSelect: (name: ThemeChoiceName) => void }>) {
  const styles = getStyles(useThemeState());
  const toolbarTestID = useDesktopStorybookTestID('theme-toolbar');
  const optionTestID = useDesktopStorybookTestID('theme');

  return (
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
              onPress={() => onSelect(name)}
              style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && styles.pressedOption]}
              testID={`${optionTestID}-${name}`}
            >
              <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{choice.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={layoutStyles.root}>{children}</View>
    </View>
  );
}

const layoutStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const getStyles = themedStyleSheetFactory('StorybookTheme', ({ tokens }) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: tokens.color.surfaceNeutralFar,
    },
    header: {
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundNeutralSubtle,
      borderBottomColor: tokens.color.strokeNeutralSubtle,
      borderBottomWidth: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    label: {
      color: tokens.color.foregroundNeutralPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginEnd: 4,
    },
    option: {
      backgroundColor: tokens.color.backgroundNeutralLoud,
      borderColor: tokens.color.strokeNeutralSoft,
      borderRadius: 4,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    selectedOption: {
      backgroundColor: tokens.color.backgroundBrandHeavy,
      borderColor: tokens.color.strokeBrandLoud,
    },
    pressedOption: {
      opacity: 0.75,
    },
    optionText: {
      color: tokens.color.foregroundNeutralPrimary,
      fontSize: 12,
    },
    selectedOptionText: {
      color: tokens.color.foregroundBrandOnloud,
      fontWeight: '600',
    },
  }),
);
