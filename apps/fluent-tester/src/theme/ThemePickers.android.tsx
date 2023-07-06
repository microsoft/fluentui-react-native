import * as React from 'react';
import { View } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import { useTheme } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import type { PickerProps } from '@react-native-picker/picker';
import { Picker } from '@react-native-picker/picker';

import { themeChoices } from './applyTheme';
import type { ThemeNames } from './applyTheme';
import { lightnessOptions, testerTheme } from './CustomThemes';

const getThemedDropdownStyles = themedStyleSheet((t: Theme) => {
  return {
    pickerRoot: {
      flexDirection: 'row',
      width: '100%',
    },
    picker: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '50%',
      padding: 4,
    },
    dropdown: {
      fontSize: 12,
      color: t.colors.bodyText,
    },
    dropdownBorder: {
      borderStyle: 'solid',
      borderColor: t.colors.disabledBodyText,
      borderWidth: 1,
      width: '100%',
    },
  };
});

const PickerLabel = Text.customize({ variant: 'subheaderSemibold' });

export const ThemePickers: React.FunctionComponent = () => {
  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  const onAppearanceChange = React.useCallback((newAppearance: string) => {
    testerTheme.appearance = newAppearance as 'light' | 'dark' | 'dynamic';
  }, []);

  const theme = useTheme();
  const themedPickerStyles = getThemedDropdownStyles(theme);

  type DropdownEntry = { label: string; value: string };

  type DropdownProps = { initial: string; onValueChange: (value: string) => void; options: DropdownEntry[]; accessibilityLabel?: string };

  const dropdownProps: Omit<PickerProps, 'onValueChange' | 'selectedValue'> = {
    style: themedPickerStyles.dropdown,
    mode: 'dropdown',
  };

  const Dropdown = (props: DropdownProps) => {
    const { initial, onValueChange, options, accessibilityLabel } = props;
    return (
      <View style={themedPickerStyles.dropdownBorder}>
        <Picker
          selectedValue={initial}
          onValueChange={onValueChange}
          dropdownIconColor={theme.colors.defaultIcon}
          {...dropdownProps}
          accessibilityLabel={accessibilityLabel}
        >
          {options.map(
            (entry: DropdownEntry, index: number) => entry && <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />,
          )}
        </Picker>
      </View>
    );
  };

  return (
    <View style={themedPickerStyles.pickerRoot}>
      <View style={themedPickerStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <Dropdown
          accessibilityLabel="Theme Selector"
          initial={testerTheme.themeName}
          onValueChange={onThemeSelected}
          options={themeChoices}
        />
      </View>

      <View style={themedPickerStyles.picker}>
        <PickerLabel>Light/Dark: </PickerLabel>
        <Dropdown
          accessibilityLabel="Light/Dark Selector"
          initial={testerTheme.appearance}
          onValueChange={onAppearanceChange}
          options={lightnessOptions}
        />
      </View>
    </View>
  );
};
