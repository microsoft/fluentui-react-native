import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON } from './consts';

export const StandardUsage: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        {/*<Text variant="captionStandard" testID={HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON}>
          CaptionStandard
        </Text>
        <Text variant="secondaryStandard">SecondaryStandard</Text>
        <Text variant="secondarySemibold">SecondarySemibold</Text>
        <Text variant="bodyStandard">BodyStandard</Text>
        <Text variant="bodySemibold">BodySemibold</Text>
        <Text variant="subheaderStandard">SubheaderStandard</Text>
        <Text variant="subheaderSemibold">SubheaderSemibold</Text>
        <Text variant="headerStandard">HeaderStandard</Text>
        <Text variant="headerSemibold">HeaderSemibold</Text>
        <Text variant="heroStandard">HeroStandard</Text>
        <Text variant="heroSemibold">HeroSemibold</Text>
        <Text variant="heroLargeStandard">HeroLargeStandard</Text>
  <Text variant="heroLargeSemibold">HeroLargeSemibold</Text>*/}
      <Text variant="caption1" testID={HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON}>
          Caption1
        </Text>
        <Text variant="body1">Body1</Text>
        <Text variant="body1Strong">Body1 Strong</Text>
        <Text variant="body2">Body2</Text>
        <Text variant="body2Strong">Body2 Strong</Text>
        <Text variant="subtitle2">Subtitle 2</Text>
        <Text variant="subtitle2Strong">Subtitle2 Strong</Text>
        <Text variant="subtitle1">Subtitle1</Text>
        <Text variant="subtitle1Strong">Subtitle1 Strong</Text>
        <Text variant="title1">Title1</Text>
        <Text variant="title1Strong">Title1 Strong</Text>
        <Text variant="largeTitle">Large Title</Text>
        <Text variant="display">Display</Text>
      </Stack>
    </View>
  );
};
