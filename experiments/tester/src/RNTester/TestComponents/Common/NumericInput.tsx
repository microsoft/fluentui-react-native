import * as React from 'react';
import { useTheme } from '@uifabricshared/theming-react-native';
import { TextInput } from 'react-native';
import { styles } from './styles';

interface INumericInputProps {
  label: string;
  maximum?: number;
  onSubmit: (value: number | undefined) => void;
}

export const NumericInput: React.FunctionComponent<INumericInputProps> = (props: INumericInputProps) => {
  const { label, onSubmit, maximum } = props;

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder,
    width: 100
  };

  return (
    <TextInput
      placeholder={label}
      style={[styles.textBox, textBoxBorderStyle]}
      blurOnSubmit={true}
      onSubmitEditing={e => {
        const stringValue = e.nativeEvent.text;
        let numericValue = stringValue ? parseInt(stringValue) : NaN;
        if (isNaN(numericValue)) {
          onSubmit(undefined);
        } else {
          numericValue = Math.max(0, numericValue);
          if (maximum) {
            numericValue = Math.min(numericValue, maximum);
          }
          onSubmit(numericValue);
        }
      }}
    />
  );
};
