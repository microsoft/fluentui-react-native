import * as React from 'react';
import { Alert, Modal, View, StyleSheet, Button } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Picker } from '@react-native-picker/picker';
import { lightnessOptionsApple, testerTheme } from './CustomThemes';
import { themeChoices, ThemeNames } from './applyTheme';
import { brandOptions, OfficeBrand } from './applyBrand';
import { Theme, useTheme } from '@fluentui-react-native/framework';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { useState } from 'react';

export const themePickerStyles = themedStyleSheet((t: Theme) => {
  return {
    pickerRoot: {
      flexDirection: 'column',
      alignContent: 'center',
    },
    picker: {
      flexDirection: 'column',
      alignItems: 'center',
      padding: 4,
      flexShrink: 0,
    },
    pickerItem: {
      color: t.colors.bodyText,
    },

    dropdown: {
      height: 200,
      width: 90,
      fontSize: 12,
    },
  };
});

type PartPickerEntry = { label: string; value: string };

type PartPickerProps = {
  initial: string;
  contents: PartPickerEntry[];
  onChange: (value: string) => void;
  enabled?: boolean;
};

export const PartPicker: React.FunctionComponent<PartPickerProps> = (props: PartPickerProps) => {
  const themedStyles = themePickerStyles(useTheme());
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
    <Picker selectedValue={value} style={themedStyles.dropdown} onValueChange={onValueChange} itemStyle={themedStyles.pickerItem}>
      {contents.map((entry: PartPickerEntry, index: number) => (
        <Picker.Item label={entry.label} value={entry.value} key={`entry${index}`} />
      ))}
    </Picker>
  );
};

const PickerLabel = Text.customize({ variant: 'bodySemibold' });

const ThemePickerRoot: React.FunctionComponent<{}> = () => {
  const themedStyles = themePickerStyles(useTheme());

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
    <View style={themedStyles.pickerRoot}>
      <View style={themedStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <PartPicker initial={testerTheme.themeName} onChange={onThemeSelected} contents={themeChoices} />
      </View>

      <View style={themedStyles.picker}>
        <PickerLabel>Light/Dark: </PickerLabel>
        <PartPicker initial={testerTheme.appearance} onChange={onAppearanceChange} contents={lightnessOptionsApple} enabled={false} />
      </View>

      <View style={themedStyles.picker}>
        <PickerLabel>Brand: </PickerLabel>
        <PartPicker initial={testerTheme.brand} onChange={onBrandChange} contents={brandOptions} />
      </View>
    </View>
  );
};

export const ThemePickers: React.FunctionComponent<{}> = () => {
  const [modalVisible, setModalVisible] = useState(true);

  return (
    <View style={{ marginTop: 22 }}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          alert('Modal has been closed.');
        }}
      >
        <View style={{ marginTop: 22 }}>
          <View>
            <ThemePickerRoot />

            <Button
              title="Close"
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            ></Button>
          </View>
        </View>
      </Modal>

      <Button
        title="Show Modal"
        onPress={() => {
          setModalVisible(true);
        }}
      ></Button>
    </View>
  );
};
