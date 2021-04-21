import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { lightnessOptions, testerTheme } from './CustomThemes';
import { themeChoices, ThemeNames } from './applyTheme';
import { brandOptions, OfficeBrand } from './applyBrand';
import { Theme, useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

const isAndroid = Platform.OS == 'android';

// To be replaced with single import when Windows support comes in.
const Picker = isAndroid ? require('@react-native-picker/picker').Picker : require('react-native').Picker;

export const themePickerStyles = StyleSheet.create({
  pickerRoot: {
    flexDirection: 'row',
  },

  picker: {
    flexDirection: isAndroid ? 'column' : 'row',
    alignItems: 'center',
    padding: 4,
  },
});

export const getThemedDropdownStyles = themedStyleSheet((t: Theme) => {
  return {
    dropdown: {
      height: 30,
      width: 120,
      fontSize: 12,
      color: t.colors.bodyText,
    },
  };
});

type PartPickerEntry = { label: string; value: string };

type PartPickerProps = {
  initial: string;
  contents: PartPickerEntry[];
  onChange: (value: string) => void;
};

export const PartPicker: React.FunctionComponent<PartPickerProps> = (props: PartPickerProps) => {
  const { initial, contents, onChange } = props;
  const [value, setValue] = React.useState(initial);
  const onValueChange = React.useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChange(newValue);
    },
    [setValue, onChange],
  );

  const themedDropdownStyles = getThemedDropdownStyles(useTheme());
  const dropdownIconColor = useTheme().colors.buttonIcon;

  return isAndroid ? (
    <Picker
      selectedValue={value}
      style={themedDropdownStyles.dropdown}
      onValueChange={onValueChange}
      dropdownIconColor={dropdownIconColor}
      mode="dropdown"
    >
      {contents.map((entry: PartPickerEntry, index: number) => (
        <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
      ))}
    </Picker>
  ) : (
    <Picker selectedValue={value} style={themedDropdownStyles.dropdown} onValueChange={onValueChange}>
      {contents.map((entry: PartPickerEntry, index: number) => (
        <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
      ))}
    </Picker>
  );
};

const PickerLabel = Text.customize({ variant: 'bodySemibold' });

export const ThemePickers: React.FunctionComponent<{}> = () => {
  const onBrandChange = React.useCallback((newBrand: string) => {
    testerTheme.brand = newBrand as OfficeBrand;
  }, []);

  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  const onAppearanceChange = React.useCallback((newAppearance: string) => {
    testerTheme.appearance = newAppearance as 'light' | 'dark' | 'dynamic';
  }, []);

  return (
    <View style={themePickerStyles.pickerRoot}>
      <View style={themePickerStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <PartPicker initial={testerTheme.themeName} onChange={onThemeSelected} contents={themeChoices} />
      </View>

      <View style={themePickerStyles.picker}>
        <PickerLabel>Light/Dark: </PickerLabel>
        <PartPicker initial={testerTheme.appearance} onChange={onAppearanceChange} contents={lightnessOptions} />
      </View>

      <View style={themePickerStyles.picker}>
        <PickerLabel>Brand: </PickerLabel>
        <PartPicker initial={testerTheme.brand} onChange={onBrandChange} contents={brandOptions} />
      </View>
    </View>
  );
};
