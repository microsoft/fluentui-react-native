import * as React from 'react';
import { View } from 'react-native';
import { Separator, Text } from '@fluentui/react-native';
import { commonTestStyles } from '../Common/styles';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonTestStyles.section}>Standard Usage</Text>
      <Separator />
      <StandardUsage />

      <Text style={commonTestStyles.section}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
