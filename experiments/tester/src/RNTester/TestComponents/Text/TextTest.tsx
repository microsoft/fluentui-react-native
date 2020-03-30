import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { styles } from './styles';
import { Text } from '@fluentui-react-native/text';

export const TextTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={styles.section}>Standard Usage</Text>
      <Separator />
      <StandardUsage />

      <Text style={styles.section}>Customize Usage</Text>
      <Separator />
      <CustomizeUsage />
    </View>
  );
};
