import { ViewStyle } from 'react-native';
import { ITheme } from '../Theme.types';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import { useTheme } from '../ThemeContext';

const getStyles = themedStyleSheet((t: ITheme) => ({
  box: {
    backgroundColor: t.colors.background
  }
}));

export const useBoxStyle = (): ViewStyle => {
  const theme = useTheme();
  return getStyles(theme).box;
};

export const getBoxStyle = (t: ITheme) => getStyles(t).box;
