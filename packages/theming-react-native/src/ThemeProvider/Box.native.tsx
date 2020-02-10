import * as React from 'react';
import { View, ViewStyle } from 'react-native';
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

type IBoxProps = React.PropsWithChildren<{}>;
export const Box: React.FunctionComponent<IBoxProps> = (p: IBoxProps) => {
  const style = useBoxStyle();
  return <View style={style} {...p} />;
};
