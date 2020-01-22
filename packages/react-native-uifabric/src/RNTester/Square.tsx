import * as React from 'react';
import { ViewProps, View } from 'react-native';

export interface ISquareProps extends ViewProps {
  color?: string;
}

export const Square: React.FunctionComponent<ISquareProps> = (props: ISquareProps) => {
  const newStyle = {
    backgroundColor: props.color || '#ff0000',
    borderColor: '#c3c3c3',
    borderWidth: 1,
    height: 40,
    width: 40
  };

  const style = props.style ? [props.style, newStyle] : newStyle;

  return <View {...props} style={style} />;
};
