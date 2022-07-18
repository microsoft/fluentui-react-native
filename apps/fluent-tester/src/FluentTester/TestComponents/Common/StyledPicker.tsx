import * as React from 'react';
import { MenuPicker } from './MenuPicker';
import { ColorValue } from 'react-native';
import { useTheme } from '@fluentui-react-native/theme-types';
import { commonTestStyles as commonStyles } from './styles';

export const StyledPicker = (props) => {
  const { prompt, selected, onChange, collection } = props;
  const theme = useTheme();
  const pickerStyles = { color: theme.colors.inputText as ColorValue, ...commonStyles.header };
  const styleCollection = collection.map((value) => {
    return {
      label: value,
      value: value,
    };
  });
  return <MenuPicker prompt={prompt} style={pickerStyles} selected={selected} onChange={onChange} collection={styleCollection} />;
};
