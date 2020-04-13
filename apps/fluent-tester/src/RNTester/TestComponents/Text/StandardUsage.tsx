import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { styles } from './styles';

export const StandardUsage: React.FunctionComponent<{}> = () => {
  return (
    <View style={styles.root}>
      <Text fontVariant="captionStandard">CaptionStandard</Text>
      <Text fontVariant="secondaryStandard">SecondaryStandard</Text>
      <Text fontVariant="secondarySemibold">SecondarySemibold</Text>
      <Text fontVariant="bodyStandard">BodyStandard</Text>
      <Text fontVariant="bodySemibold">BodySemibold</Text>
      <Text fontVariant="subheaderStandard">SubheaderStandard</Text>
      <Text fontVariant="subheaderSemibold">SubheaderSemibold</Text>
      <Text fontVariant="headerStandard">HeaderStandard</Text>
      <Text fontVariant="headerSemibold">HeaderSemibold</Text>
      <Text fontVariant="heroStandard">HeroStandard</Text>
      <Text fontVariant="heroSemibold">HeroSemibold</Text>
      <Text fontVariant="heroLargeStandard">HeroLargeStandard</Text>
      <Text fontVariant="heroLargeSemibold">HeroLargeSemibold</Text>
    </View>
  );
};
