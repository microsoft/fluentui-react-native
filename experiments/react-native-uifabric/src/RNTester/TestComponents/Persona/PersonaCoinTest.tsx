import * as React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '../../../components/Separator';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Standard Usage</Text>
      <Separator />
      <StandardUsage />

      <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 20 }}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
