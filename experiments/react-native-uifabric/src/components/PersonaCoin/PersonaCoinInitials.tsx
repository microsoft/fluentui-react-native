import * as React from 'react';
import { View, Text, StyleProp, TextStyle } from 'react-native';

export interface IPersonaCoinInitials {
  style?: StyleProp<TextStyle>;
  initials?: string;
}

export const Initials: React.FunctionComponent<IPersonaCoinInitials> = (props: IPersonaCoinInitials) => {
  const { style, initials } = props;

  return (
    <View style={[style, { flexGrow: 1, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={style}>{initials}</Text>
    </View>
  );
};
