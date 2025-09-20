import { Platform } from 'react-native';
import type { ColorValue } from 'react-native';

import { useTheme } from '@fluentui-react-native/theme-types';

import { MenuPicker } from './MenuPicker';
import { commonTestStyles as commonStyles } from './styles';

export const StyledPicker = (props) => {
  const { prompt, selected, onChange, collection, style } = props;
  const theme = useTheme();
  const pickerStyles = {
    color: theme.colors.inputText as ColorValue,
    alignSelf: Platform.OS === 'ios' ? 'flex-start' : 'auto',
    ...commonStyles.header,
    ...style,
  };
  const styleCollection = collection.map((value) => {
    return {
      label: value,
      value: value,
    };
  });
  return <MenuPicker prompt={prompt} style={pickerStyles} selected={selected} onChange={onChange} collection={styleCollection} />;
};
