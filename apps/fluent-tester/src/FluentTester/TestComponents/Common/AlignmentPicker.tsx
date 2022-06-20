import * as React from 'react';
import { undefinedText } from '../PersonaCoin/styles';
import { IconAlignment } from '@fluentui/react-native';
import { StyleProp, ViewStyle, Platform, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MenuPicker } from './MenuPicker';

const alignmentValues: Array<typeof undefinedText | IconAlignment> = [undefinedText, 'start', 'center', 'end'];

interface IAlignmentPickerProps {
  style?: StyleProp<ViewStyle>;
  label: string;
  onSelectionChange: (value: IconAlignment) => void;
}

export const AlignmentPicker: React.FunctionComponent<IAlignmentPickerProps> = (props: IAlignmentPickerProps) => {
  const { label, onSelectionChange, style } = props;
  const [selectedValue, setSelectedValue] = React.useState<IconAlignment>();
  const renderMenuPicker = Platform.OS == ('win32' as any) || Platform.OS == 'macos';

  const MenuPickers = () => {
    return (
      <MenuPicker
        style={style}
        prompt={label}
        selected={selectedValue || undefinedText}
        onChange={(value: IconAlignment, index: number) => {
          const alignmentValue = index == 0 ? undefined : value;
          onSelectionChange(alignmentValue);
          setSelectedValue(alignmentValue);
        }}
        collection={alignmentValues}
      />
    );
  };

  const Pickers = () => {
    return (
      <Picker
        style={style}
        prompt={label}
        selectedValue={undefined}
        onValueChange={(value: IconAlignment, index: number) => onSelectionChange(index == 0 ? undefined : value)}
      >
        {alignmentValues.map((alignment, index) => (
          <Picker.Item label={alignment} key={index} value={alignment} />
        ))}
      </Picker>
    );
  };

  return <View>{renderMenuPicker ? <MenuPickers /> : <Pickers />}</View>;
};
