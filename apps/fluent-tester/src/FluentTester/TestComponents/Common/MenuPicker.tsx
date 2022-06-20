import * as React from 'react';
import { Text, View, Platform } from 'react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { SvgXml } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';

const chevronXml = `
<svg width="12" height="16" viewBox="0 0 11 6" color="#000">
  <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
</svg>`;

interface MenuPickerProps {
  prompt?: string;
  selected?: any;
  onChange?: (value: any, index?: number) => void;
  collection?: any[];
  style?: any;
}

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, selected, onChange, collection, style } = props;

  const renderDesktopPicker = Platform.OS == ('win32' as any) || Platform.OS == 'macos';

  const DesktopPicker = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5 }}>
        <Text style={{ marginRight: 5 }}>{prompt}</Text>
        <Menu>
          <MenuTrigger>
            <Button>
              <Text>{selected}</Text>
              <View style={{ padding: 4 }}>
                <SvgXml xml={chevronXml} />
              </View>
            </Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {collection.map((value, index) => (
                <MenuItem onClick={() => onChange(value, index)} key={index}>
                  {value}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </View>
    );
  };

  const MobilePicker = () => {
    return (
      <Picker
        prompt="Background Color"
        selectedValue={selected}
        onValueChange={(itemValue: any, index: number) => onChange(itemValue, index)}
        style={{ ...style }}
      >
        {collection.map((value, index) => (
          <Picker.Item label={value} key={index} value={value} />
        ))}
      </Picker>
    );
  };

  return <View>{renderDesktopPicker ? <DesktopPicker /> : <MobilePicker />}</View>;
};
