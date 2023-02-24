import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';

import { HOMEPAGE_TEXTV1_BUTTON } from '../../../../E2E/src/TextV1/consts';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const StandardUsage: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Text
          variant="captionStandard"
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(HOMEPAGE_TEXTV1_BUTTON)}
        >
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
        <Text variant="heroLargeSemibold">HeroLargeSemibold</Text>
      </Stack>
    </View>
  );
};
