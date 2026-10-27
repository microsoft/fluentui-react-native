/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { themedStyleSheetFactory, useThemeState } from '@fluentui-react-native/design';
import { Dropdown } from '../../components/dropdown/dropdown';
import { ListboxItem } from '../../components/listbox-item/listbox-item';
import { Text } from '../../components/text/text';
import { SYSTEM_APPEARANCE } from './theme-selection';
import type { ThemePickerProps, TestThemeSelection, TestThemeSource } from './theme-picker.types';

const sourceValues = ['inherit', 'flex', 'fluent'] as const;
const colorSchemeValues = ['system', 'light', 'dark'] as const;
const contrastValues = ['system', 'standard', 'highContrast'] as const;

const sourceLabels: Record<(typeof sourceValues)[number], string> = {
  inherit: 'Inherited theme',
  flex: 'Default Flex',
  fluent: 'Default Fluent',
};

const colorSchemeLabels: Record<(typeof colorSchemeValues)[number], string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const contrastLabels: Record<(typeof contrastValues)[number], string> = {
  system: 'System',
  standard: 'Standard',
  highContrast: 'High contrast',
};

function isValue<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.some((candidate) => candidate === value);
}

function explicitSelection(selection: TestThemeSelection, source?: TestThemeSource): TestThemeSelection {
  if (selection.source !== 'inherit') {
    return source && source !== selection.source ? { source, appearance: selection.appearance } : selection;
  }
  return { source: source ?? 'flex', appearance: SYSTEM_APPEARANCE };
}

export function ThemePicker({ selection, onSelectionChange, testIDPrefix = 'theme-picker', style }: ThemePickerProps) {
  const styles = getStyles(useThemeState());
  const inherited = selection.source === 'inherit';
  const sourceValue = selection.source;
  const appearance = inherited ? undefined : selection.appearance;

  const onSourceChange = React.useCallback(
    (selectedOptions: string[]) => {
      const value = selectedOptions[0];
      if (!value || !isValue(sourceValues, value)) {
        return;
      }
      if (value === 'inherit') {
        onSelectionChange({ source: 'inherit' });
        return;
      }
      onSelectionChange(explicitSelection(selection, value));
    },
    [onSelectionChange, selection],
  );

  const onColorSchemeChange = React.useCallback(
    (selectedOptions: string[]) => {
      const value = selectedOptions[0];
      if (selection.source === 'inherit' || !value || !isValue(colorSchemeValues, value)) {
        return;
      }
      onSelectionChange({ ...selection, appearance: { ...appearance, colorScheme: value } });
    },
    [appearance, onSelectionChange, selection],
  );

  const onContrastChange = React.useCallback(
    (selectedOptions: string[]) => {
      const value = selectedOptions[0];
      if (selection.source === 'inherit' || !value || !isValue(contrastValues, value)) {
        return;
      }
      onSelectionChange({ ...selection, appearance: { ...appearance, contrast: value } });
    },
    [appearance, onSelectionChange, selection],
  );

  return (
    <View accessibilityRole="toolbar" style={[styles.root, style]} testID={`${testIDPrefix}-toolbar`}>
      <Text style={styles.label}>Theme</Text>
      <Dropdown
        accessibilityLabel="Theme source"
        selectedOptions={[sourceValue]}
        onSelectedOptionsChange={onSourceChange}
        style={styles.dropdown}
        testID={`${testIDPrefix}-source`}
        listbox={{ testID: `${testIDPrefix}-source-listbox` }}
        trigger={{ testID: `${testIDPrefix}-source-trigger` }}
      >
        {sourceValues.map((value) => (
          <ListboxItem key={value} content={sourceLabels[value]} testID={`${testIDPrefix}-source-${value}`} value={value} />
        ))}
      </Dropdown>
      <Dropdown
        accessibilityLabel="Color scheme"
        disabled={inherited}
        selectedOptions={[appearance?.colorScheme ?? 'system']}
        onSelectedOptionsChange={onColorSchemeChange}
        style={styles.dropdown}
        testID={`${testIDPrefix}-color-scheme`}
        listbox={{ testID: `${testIDPrefix}-color-scheme-listbox` }}
        trigger={{ testID: `${testIDPrefix}-color-scheme-trigger` }}
      >
        {colorSchemeValues.map((value) => (
          <ListboxItem key={value} content={colorSchemeLabels[value]} testID={`${testIDPrefix}-color-scheme-${value}`} value={value} />
        ))}
      </Dropdown>
      <Dropdown
        accessibilityLabel="Contrast"
        disabled={inherited}
        selectedOptions={[appearance?.contrast ?? 'system']}
        onSelectedOptionsChange={onContrastChange}
        style={styles.dropdown}
        testID={`${testIDPrefix}-contrast`}
        listbox={{ testID: `${testIDPrefix}-contrast-listbox` }}
        trigger={{ testID: `${testIDPrefix}-contrast-trigger` }}
      >
        {contrastValues.map((value) => (
          <ListboxItem key={value} content={contrastLabels[value]} testID={`${testIDPrefix}-contrast-${value}`} value={value} />
        ))}
      </Dropdown>
    </View>
  );
}

ThemePicker.displayName = 'ThemePicker';

const getStyles = themedStyleSheetFactory('ThemePicker', ({ tokens }) =>
  StyleSheet.create({
    root: {
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
    dropdown: {
      minWidth: 140,
      maxWidth: 220,
    },
  }),
);
