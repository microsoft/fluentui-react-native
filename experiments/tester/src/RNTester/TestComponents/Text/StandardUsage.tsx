import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-native/text';
import { styles } from './styles';

export const StandardUsage: React.FunctionComponent<{}> = () => {
  return (
    <View style={styles.root}>
      <Text fontVariant="smallStandard">SmallStandard</Text>
      <Text fontVariant="mediumStandard">MediumStandard</Text>
      <Text fontVariant="mediumSemibold">MediumSemibold</Text>
      <Text fontVariant="mediumBold">MediumBold</Text>
      <Text fontVariant="mediumPlusStandard">MediumPlusStandard</Text>
      <Text fontVariant="mediumPlusSemibold">MediumPlusSemibold</Text>
      <Text fontVariant="largeStandard">LargeStandard</Text>
      <Text fontVariant="largeSemibold">LargeSemibold</Text>
      <Text fontVariant="largePlusStandard">LargePlusStandard</Text>
      <Text fontVariant="largePlusSemibold">LargePlusSemibold</Text>
      <Text fontVariant="extraLargeStandard">ExtraLargeStandard</Text>
      <Text fontVariant="extraLargeSemibold">ExtraLargeSemibold</Text>
      <Text fontVariant="hugeStandard">HugeStandard</Text>
      <Text fontVariant="hugeSemibold">HugeSemibold</Text>
      <Text fontVariant="giantStandard">GiantStandard</Text>
      <Text fontVariant="giantSemibold">GiantSemibold</Text>
    </View>
  );
};
