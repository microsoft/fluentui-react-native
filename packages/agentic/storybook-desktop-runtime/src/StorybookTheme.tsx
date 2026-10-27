import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { FlexThemeReference, ThemedRoot, themedStyleSheetFactory, useThemeState } from '@fluentui-react-native/design';
import type { ColorTone, ThemeAppearanceOptions, ThemeSource } from '@fluentui-react-native/design';

import { useDesktopStorybookTestID } from './DesktopStorybookConfig';

/** The theme configuration selected in the Storybook toolbar. */
export type StorybookThemeSelection = {
  /** The package's Flex defaults or the legacy Fluent default theme. */
  source: 'flex' | 'fluent';
  colorScheme: 'light' | 'dark' | 'system';
  contrast: 'standard' | 'highContrast';
  /** Flex palette and interaction tone. Legacy Fluent themes have no tone. */
  colorTone: ColorTone;
};

type ThemeAxisKey = keyof StorybookThemeSelection;

type ThemeAxis = {
  readonly key: ThemeAxisKey;
  /** Stable test-ID segment for the axis and its options. */
  readonly id: string;
  readonly label: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
};

/** A deterministic default that does not depend on the host appearance. */
export const defaultStorybookThemeSelection: Readonly<StorybookThemeSelection> = Object.freeze({
  source: 'flex',
  colorScheme: 'light',
  contrast: 'standard',
  colorTone: 'cool',
});

function themeAxis<Key extends ThemeAxisKey>(
  key: Key,
  id: string,
  label: string,
  options: readonly { value: StorybookThemeSelection[Key]; label: string }[],
): ThemeAxis {
  return { key, id, label, options };
}

const themeAxes: readonly ThemeAxis[] = [
  themeAxis('source', 'source', 'Theme', [
    { value: 'flex', label: 'Flex' },
    { value: 'fluent', label: 'Fluent' },
  ]),
  themeAxis('colorScheme', 'scheme', 'Scheme', [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]),
  themeAxis('contrast', 'contrast', 'Contrast', [
    { value: 'standard', label: 'Standard' },
    { value: 'highContrast', label: 'High' },
  ]),
  themeAxis('colorTone', 'tone', 'Tone', [
    { value: 'cool', label: 'Cool' },
    { value: 'warm', label: 'Warm' },
  ]),
];

// Each source resolves every appearance itself, so selection changes only the appearance request.
const themeSources: Record<StorybookThemeSelection['source'], ThemeSource> = {
  flex: new FlexThemeReference(),
  fluent: createDefaultTheme({ appearance: 'dynamic' }),
};

function appearanceFromSelection({ source, colorScheme, contrast, colorTone }: StorybookThemeSelection): ThemeAppearanceOptions {
  // Omitting tone for Fluent keeps the resolved appearance at its cool default.
  return source === 'flex' ? { colorScheme, contrast, colorTone } : { colorScheme, contrast };
}

function isAxisDisabled(key: ThemeAxisKey, selection: StorybookThemeSelection): boolean {
  return key === 'colorTone' && selection.source !== 'flex';
}

export function StorybookThemeHost({ children }: React.PropsWithChildren) {
  const [selection, setSelection] = React.useState<StorybookThemeSelection>(defaultStorybookThemeSelection);
  const appearance = React.useMemo(() => appearanceFromSelection(selection), [selection]);
  const testID = useDesktopStorybookTestID('app-root');

  return (
    <ThemedRoot appearance={appearance} style={layoutStyles.root} testID={testID} theme={themeSources[selection.source]}>
      <StorybookThemeContent selection={selection} onSelectionChange={setSelection}>
        {children}
      </StorybookThemeContent>
    </ThemedRoot>
  );
}

function StorybookThemeContent({
  children,
  selection,
  onSelectionChange,
}: React.PropsWithChildren<{
  selection: StorybookThemeSelection;
  onSelectionChange: React.Dispatch<React.SetStateAction<StorybookThemeSelection>>;
}>) {
  const styles = getStyles(useThemeState());
  const toolbarTestID = useDesktopStorybookTestID('theme-toolbar');
  const axisTestID = useDesktopStorybookTestID('theme');
  const [openAxis, setOpenAxis] = React.useState<ThemeAxisKey>();

  const select = (key: ThemeAxisKey, value: string) => {
    onSelectionChange((current) => (current[key] === value ? current : ({ ...current, [key]: value } as StorybookThemeSelection)));
    setOpenAxis(undefined);
  };

  return (
    <View style={styles.root}>
      <View accessibilityRole="toolbar" style={styles.header} testID={toolbarTestID}>
        {themeAxes.map((axis) => {
          const disabled = isAxisDisabled(axis.key, selection);
          return (
            <ThemeAxisDropdown
              axis={axis}
              disabled={disabled}
              key={axis.key}
              open={!disabled && openAxis === axis.key}
              styles={styles}
              testID={`${axisTestID}-${axis.id}`}
              value={disabled ? defaultStorybookThemeSelection[axis.key] : selection[axis.key]}
              onSelect={(value) => select(axis.key, value)}
              onToggle={() => setOpenAxis((current) => (current === axis.key ? undefined : axis.key))}
            />
          );
        })}
      </View>
      <View style={layoutStyles.root}>{children}</View>
    </View>
  );
}

type ThemeAxisDropdownProps = {
  axis: ThemeAxis;
  disabled: boolean;
  open: boolean;
  styles: ReturnType<typeof getStyles>;
  testID: string;
  value: string;
  onSelect(value: string): void;
  onToggle(): void;
};

function ThemeAxisDropdown({ axis, disabled, open, styles, testID, value, onSelect, onToggle }: ThemeAxisDropdownProps) {
  const selectedLabel = axis.options.find((option) => option.value === value)?.label ?? value;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, disabled && styles.disabledText]}>{axis.label}</Text>
      <View>
        <Pressable
          accessibilityLabel={axis.label}
          accessibilityRole="combobox"
          accessibilityState={{ disabled, expanded: open }}
          accessibilityValue={{ text: selectedLabel }}
          disabled={disabled}
          onPress={onToggle}
          style={({ pressed }) => [styles.option, styles.trigger, pressed && styles.pressedOption, disabled && styles.disabledOption]}
          testID={testID}
        >
          <Text style={[styles.optionText, disabled && styles.disabledText]}>{selectedLabel}</Text>
          <Text style={[styles.chevron, disabled && styles.disabledText]}>{open ? '\u25b4' : '\u25be'}</Text>
        </Pressable>
        {open ? (
          <View accessibilityRole="list" style={styles.menu} testID={`${testID}-menu`}>
            {axis.options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={({ pressed }) => [
                    styles.menuOption,
                    selected && styles.selectedOption,
                    pressed && (selected ? styles.pressedSelectedOption : styles.pressedMenuOption),
                  ]}
                  testID={`${testID}-${option.value}`}
                >
                  <Text style={[styles.optionText, selected && styles.selectedOptionText]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
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
      backgroundColor: tokens.color.surfaceNeutralFar.rest,
    },
    header: {
      alignItems: 'flex-start',
      backgroundColor: tokens.color.backgroundNeutralSubtle.rest,
      borderBottomColor: tokens.color.strokeNeutralSubtle.rest,
      borderBottomWidth: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    field: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 6,
    },
    label: {
      color: tokens.color.foregroundNeutralPrimary.rest,
      fontSize: 14,
      fontWeight: '600',
      paddingVertical: 5,
    },
    option: {
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderColor: tokens.color.strokeNeutralLoud.rest,
      borderRadius: 4,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    trigger: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
      minWidth: 96,
    },
    pressedOption: {
      backgroundColor: tokens.color.surfaceNeutralNearer.pressed,
      borderColor: tokens.color.strokeNeutralLoud.pressed,
    },
    disabledOption: {
      backgroundColor: tokens.color.backgroundNeutralDisabled.rest,
      borderColor: tokens.color.strokeNeutralDisabled.rest,
    },
    menu: {
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderColor: tokens.color.strokeNeutralSubtle.rest,
      borderRadius: 4,
      borderWidth: 1,
      gap: 2,
      marginTop: 4,
      padding: 2,
    },
    menuOption: {
      backgroundColor: tokens.color.backgroundNeutralTransparent.rest,
      borderRadius: 3,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    pressedMenuOption: {
      backgroundColor: tokens.color.backgroundNeutralTransparent.pressed,
    },
    selectedOption: {
      backgroundColor: tokens.color.backgroundNeutralSoft.rest,
    },
    pressedSelectedOption: {
      backgroundColor: tokens.color.backgroundNeutralSoft.pressed,
    },
    optionText: {
      color: tokens.color.foregroundNeutralPrimary.rest,
      fontSize: 12,
    },
    chevron: {
      color: tokens.color.foregroundNeutralSecondary.rest,
      fontSize: 12,
    },
    selectedOptionText: {
      fontWeight: '600',
    },
    disabledText: {
      color: tokens.color.foregroundNeutralDisabled.rest,
    },
  }),
);
