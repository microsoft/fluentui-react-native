import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-native/text';
import { styles } from './styles';

export const StandardUsage: React.FunctionComponent<{}> = () => {
  return (
    <View style={styles.root}>
      <Text fontVariant="smallStandard">SmallStandard</Text>
      <Text fontVariant="mediumStandard">MediumStandard</Text>
      <Text fontVariant="mediumBold">MediumBold</Text>
      <Text fontVariant="largeStandard">LargeStandard</Text>
      <Text fontVariant="largePlusStandard">LargePlusStandard</Text>
      <Text fontVariant="largePlusSemibold">LargePlusSemibold</Text>
      <Text fontVariant="extraLargeStandard">ExtraLargeStandard</Text>
      <Text fontVariant="hugeStandard">HugeStandard</Text>
    </View>
  );
};
