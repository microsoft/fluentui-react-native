import * as React from 'react';
import { undefinedText } from '../PersonaCoin/styles';
import { IconAlignment } from '@fluentui/react-native';
import { StyleProp, ViewStyle } from 'react-native';
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
  const alignmentCollection = alignmentValues.map((value) => {
    return {
      label: value,
      value: value,
    };
  });
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
      collection={alignmentCollection}
    />
  );
};
