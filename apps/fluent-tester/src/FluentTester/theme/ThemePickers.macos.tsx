import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Picker } from '@react-native-picker/picker';
import { testerTheme } from './CustomThemes';
import { themeChoices, ThemeNames } from './applyTheme';
import { brandOptions, OfficeBrand } from './applyBrand';

export const themePickerStyles = StyleSheet.create({
  pickerRoot: {
    flexDirection: 'row',
  },

  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },

  dropdown: {
    height: 30,
    width: 90,
    fontSize: 12,
  },
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
  return (
    <Picker selectedValue={value} style={themePickerStyles.dropdown} onValueChange={onValueChange}>
      {contents.map((entry: PartPickerEntry, index: number) => (
        <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
      ))}
    </Picker>
  );
};

const PickerLabel = Text.customize({ variant: 'bodySemibold' });

export const ThemePickers: React.FunctionComponent = () => {
  const onBrandChange = React.useCallback((newBrand: string) => {
    testerTheme.brand = newBrand as OfficeBrand;
  }, []);

  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  return (
    <View style={themePickerStyles.pickerRoot}>
      <View style={themePickerStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <PartPicker initial={testerTheme.themeName} onChange={onThemeSelected} contents={themeChoices} />
      </View>

      <View style={themePickerStyles.picker}>
        <PickerLabel>Brand: </PickerLabel>
        <PartPicker initial={testerTheme.brand} onChange={onBrandChange} contents={brandOptions} />
      </View>
    </View>
  );
};
