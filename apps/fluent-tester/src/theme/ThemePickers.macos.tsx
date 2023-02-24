import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { SvgXml } from 'react-native-svg';

import type { ThemeNames } from './applyTheme';
import { themeChoices } from './applyTheme';
import { testerTheme } from './CustomThemes';

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

const themeMenuPickerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  svg: {
    padding: 4,
  },
});

type PartPickerEntry = { label: string; value: string };

type PartPickerProps = {
  initial: string;
  contents: PartPickerEntry[];
  onChange: (value: string) => void;
};

const ThemeMenuPicker = ({ selected, onChange, collection, style }) => {
  const chevronXml = `
  <svg width="12" height="16" viewBox="0 0 11 6" color="#000">
    <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
  </svg>`;

  return (
    <View style={{ ...themeMenuPickerStyles.container, ...style }}>
      <Menu>
        <MenuTrigger>
          <Button>
            <Text>{selected}</Text>
            <View style={themeMenuPickerStyles.svg}>
              <SvgXml xml={chevronXml} />
            </View>
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {collection.map((entry: PartPickerEntry, index: number) => (
              <MenuItem onClick={() => onChange(entry.value)} key={`entry${index}`}>
                {entry.label}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </View>
  );
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
  return <ThemeMenuPicker selected={value} style={themePickerStyles.dropdown} onChange={onValueChange} collection={contents} />;
};

const PickerLabel = Text.customize({ variant: 'bodySemibold' });

export const ThemePickers: React.FunctionComponent = () => {
  const onThemeSelected = React.useCallback((newTheme: string) => {
    testerTheme.themeName = newTheme as ThemeNames;
  }, []);

  return (
    <View style={themePickerStyles.pickerRoot}>
      <View style={themePickerStyles.picker}>
        <PickerLabel>Theme: </PickerLabel>
        <PartPicker initial={testerTheme.themeName} onChange={onThemeSelected} contents={themeChoices} />
      </View>
    </View>
  );
};
