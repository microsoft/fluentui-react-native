import * as React from 'react';
import type { ViewProps, StyleProp, ViewStyle, ColorValue } from 'react-native';
import { View } from 'react-native';

export interface ISquareProps extends ViewProps {
  color?: ColorValue;
}

export const Square: React.FunctionComponent<ISquareProps> = (props: ISquareProps) => {
  const newStyle: ViewStyle = {
    backgroundColor: props.color || '#ff0000',
    borderColor: '#c3c3c3',
    borderWidth: 1,
    height: 40,
    width: 40,
  };

  const style: StyleProp<ViewStyle> = props.style ? [props.style, newStyle] : newStyle;

  return <View {...props} style={style} />;
};
