import * as React from 'react';
import { View, PickerPropsAndroid } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { lightnessOptions, testerTheme } from './CustomThemes';
import { themeChoices, ThemeNames } from './applyTheme';
import { brandOptions, OfficeBrand } from './applyBrand';
import { Theme, useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Picker } from '@react-native-picker/picker';

const getThemedDropdownStyles = themedStyleSheet((t: Theme) => {
  return {
    pickerRoot: {
      flexDirection: 'row',
    },
    picker: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 4,
    },
    dropdown: {
      height: 30,
      width: 120,
      fontSize: 12,
      color: t.colors.bodyText,
    },
  };
});

const PickerLabel = Text.customize({ variant: 'subheaderSemibold' });

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

  const theme = useTheme();
  const themePickerStyles = getThemedDropdownStyles(theme);
  const dropdownProps: PickerPropsAndroid & { dropdownIconColor: string } = {
    style: themePickerStyles.dropdown,
    mode: 'dropdown',
    dropdownIconColor: theme.colors.buttonIcon,
  };

  return (
    <View style={themePickerStyles.pickerRoot}>
      <View style={themePickerStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <Picker selectedValue={testerTheme.themeName} onValueChange={onThemeSelected} {...dropdownProps}>
          {themeChoices.map((entry, index) => (
            <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
          ))}
        </Picker>
      </View>

      <View style={themePickerStyles.picker}>
        <PickerLabel>Light/Dark: </PickerLabel>
        <Picker selectedValue={testerTheme.appearance} onValueChange={onAppearanceChange} {...dropdownProps}>
          {lightnessOptions.map((entry, index) => (
            <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
          ))}
        </Picker>
      </View>

      <View style={themePickerStyles.picker}>
        <PickerLabel>Brand: </PickerLabel>
        <Picker selectedValue={testerTheme.brand} onValueChange={onBrandChange} {...dropdownProps}>
          {brandOptions.map((entry, index) => (
            <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
          ))}
        </Picker>
      </View>
    </View>
  );
};
