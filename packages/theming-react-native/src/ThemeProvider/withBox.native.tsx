import * as React from 'react';
import { StyleProp, View } from 'react-native';
import { ITheme } from '../Theme.types';
import { themedStyleSheet } from '@uifabricshared/themed-stylesheet';
import { useTheme } from '../ThemeContext';

const getStyles = themedStyleSheet((t: ITheme) => ({
  box: {
    backgroundColor: t.colors.background
  }
}));

type IWithBoxProps = { style?: StyleProp<object> };
export const withBox = (WrappedComponent: React.ComponentType<IWithBoxProps> = View): React.FunctionComponent<IWithBoxProps> => (
  props: IWithBoxProps
) => {
  const { style, ...rest } = props;
  const theme = useTheme();
  const boxStyle = getStyles(theme).box;
  return <WrappedComponent {...rest} style={[style, boxStyle]} />;
};
