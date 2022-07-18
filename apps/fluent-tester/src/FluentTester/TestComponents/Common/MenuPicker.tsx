import * as React from 'react';
import { Picker } from '@react-native-picker/picker';

/*
 * The MenuPicker was created because the RN Core Picker was deprecated (preventing us from updating to RN 0.66).
 * MenuPicker uses the community Picker package for iOS/Win32 and our own Picker for Win32/MacOS.
 */

interface MenuPickerProps {
  prompt?: string;
  selected?: any;
  onChange?: (label: string, value?: string) => void;
  collection?: any[];
  style?: any;
}

export const MenuPicker: React.FunctionComponent<MenuPickerProps> = (props: MenuPickerProps) => {
  const { prompt, selected, onChange, collection, style } = props;

  return (
    <Picker
      prompt={prompt}
      selectedValue={selected}
      onValueChange={(itemValue: any, index: number) => onChange(itemValue, index.toString())}
      style={{ ...style }}
    >
      {collection.map((value, index) => (
        <Picker.Item label={value} key={index} value={value} />
      ))}
    </Picker>
  );
};
