import * as React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface IPersonaCoinInitials {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  initials?: string;
}

export const Initials: React.FunctionComponent<IPersonaCoinInitials> = (props: IPersonaCoinInitials) => {
  const { style, textStyle, initials } = props;
  return (
    <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={textStyle}>{initials}</Text>
    </View>
  );
};
