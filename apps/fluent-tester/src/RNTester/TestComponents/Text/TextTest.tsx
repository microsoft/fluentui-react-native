import * as React from 'react';
import { View, Text } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const TextTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section}>Standard Usage</Text>
      <Separator />
      <StandardUsage />

      <Text style={commonStyles.section}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
