import * as React from 'react';
import { undefinedText } from '../PersonaCoin/styles';
import { IconAlignment } from '@fluentui/react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { Picker } from '@react-native-community/picker';

const alignmentValues: Array<typeof undefinedText | IconAlignment> = [undefinedText, 'start', 'center', 'end'];

interface IAlignmentPickerProps {
  style?: StyleProp<ViewStyle>;
  label: string;
  onSelectionChange: (value: IconAlignment | undefined) => void;
}

export const AlignmentPicker: React.FunctionComponent<IAlignmentPickerProps> = (props: IAlignmentPickerProps) => {
  const { label, onSelectionChange, style } = props;
  return (
    <Picker
      style={style}
      prompt={label}
      selectedValue={undefinedText}
      onValueChange={(value, index) => onSelectionChange(index == 0 ? undefined : (value as IconAlignment))}
    >
      {alignmentValues.map((alignment, index) => (
        <Picker.Item label={alignment} key={index} value={alignment} />
      ))}
    </Picker>
  );
};
