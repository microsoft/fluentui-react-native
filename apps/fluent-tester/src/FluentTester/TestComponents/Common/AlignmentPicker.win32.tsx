import * as React from 'react';
import { undefinedText } from '../PersonaCoin/styles';
import { IconAlignment } from '@fluentui/react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { MenuPicker } from './MenuPicker';

const alignmentValues: Array<typeof undefinedText | IconAlignment> = [undefinedText, 'start', 'center', 'end'];

interface IAlignmentPickerProps {
  style?: StyleProp<ViewStyle>;
  label: string;
  onSelectionChange: (value: IconAlignment | undefined) => void;
}

export const AlignmentPicker: React.FunctionComponent<IAlignmentPickerProps> = (props: IAlignmentPickerProps) => {
  const { label, onSelectionChange, style } = props;
  return (
    <MenuPicker
      style={style}
      prompt={label}
      selectedValue={undefinedText}
      onChange={(value: IconAlignment, index) => onSelectionChange(index == 0 ? undefined : value)}
      collection={alignmentValues}
    />
  );
};
