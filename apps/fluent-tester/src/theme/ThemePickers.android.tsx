import * as React from 'react';
import { View } from 'react-native';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { lightnessOptions, testerTheme } from './CustomThemes';
import { Theme, useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Picker, PickerProps } from '@react-native-picker/picker';

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
    dropdownBorder: {
      borderStyle: 'solid',
      borderColor: t.colors.disabledBodyText,
      borderWidth: 1,
    },
  };
});

const PickerLabel = Text.customize({ variant: 'subheaderSemibold' });

export const ThemePickers: React.FunctionComponent = () => {
  const onAppearanceChange = React.useCallback((newAppearance: string) => {
    testerTheme.appearance = newAppearance as 'light' | 'dark';
  }, []);

  const theme = useTheme();
  const themedPickerStyles = getThemedDropdownStyles(theme);

  type DropdownEntry = { label: string; value: string };

  type DropdownProps = { initial: string; onValueChange: (value: string) => void; options: DropdownEntry[] };

  const dropdownProps: Omit<PickerProps, 'onValueChange' | 'selectedValue'> = {
    style: themedPickerStyles.dropdown,
    mode: 'dropdown',
  };

  const Dropdown = (props: DropdownProps) => {
    const { initial, onValueChange, options } = props;
    return (
      <View style={themedPickerStyles.dropdownBorder}>
        <Picker selectedValue={initial} onValueChange={onValueChange} dropdownIconColor={theme.colors.defaultIcon} {...dropdownProps}>
          {options.map((entry: DropdownEntry, index: number) => (
            <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <View style={themedPickerStyles.pickerRoot}>
      <View style={themedPickerStyles.picker}>
        <PickerLabel>Light/Dark: </PickerLabel>
        <Dropdown initial={testerTheme.appearance} onValueChange={onAppearanceChange} options={lightnessOptions} />
      </View>
    </View>
  );
};
