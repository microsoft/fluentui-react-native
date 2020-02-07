import * as React from 'react';
import { View, Text } from 'react-native';

export interface IPersonaCoinInitials {
  size: number;
  fontSize: number;
  backgroundColor?: string;
  color?: string;
  initials?: string;
}

export const Initials: React.FunctionComponent<IPersonaCoinInitials> = (props: IPersonaCoinInitials) => {
  const { size, fontSize, backgroundColor, color, initials } = props;

  return (
    <View
      style={{
        borderRadius: size / 2,
        width: size,
        height: size,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize, color }}>{initials}</Text>
    </View>
  );
};
