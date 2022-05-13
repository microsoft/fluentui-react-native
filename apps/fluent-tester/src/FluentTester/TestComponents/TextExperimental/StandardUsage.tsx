import * as React from 'react';
import { Platform, View } from 'react-native';
import {
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Body2,
  Body2Strong,
  Subtitle1,
  Subtitle1Strong,
  Subtitle2,
  Subtitle2Strong,
  Title1,
  Title1Strong,
  LargeTitle,
  Display,
} from '@fluentui-react-native/experimental-text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON } from './consts';

export const StandardUsage: React.FunctionComponent = () => {
  const V1Usage: React.FunctionComponent = () => {
    return (
      <View>
        <Stack style={stackStyle} gap={5}>
          <Text variant="captionStandard" testID={HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON}>
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

  const V2Usage: React.FunctionComponent = () => {
    return (
      <View>
        <Stack style={stackStyle} gap={5}>
          <Caption1>Caption1</Caption1>
          <Body1>Body1</Body1>
          <Body1Strong>Body1Strong</Body1Strong>
          <Body2>Body2</Body2>
          <Body2Strong>Body2Strong</Body2Strong>
          <Subtitle1>Subtitle1</Subtitle1>
          <Subtitle1Strong>Subtitle1Strong</Subtitle1Strong>
          <Subtitle2>Subtitle2</Subtitle2>
          <Subtitle2Strong>Subtitle2Strong</Subtitle2Strong>
          <Title1>Title1</Title1>
          <Title1Strong>Title1Strong</Title1Strong>
          <LargeTitle>LargeTitle</LargeTitle>
          <Display>Display</Display>
        </Stack>
      </View>
    );
  };

  switch (Platform.OS) {
    case 'android':
      return <V1Usage />;
    case 'ios':
      return <V1Usage />;
    case 'macos':
      return <V1Usage />;
    default:
      return (
        <View>
          <V1Usage />
          <V2Usage />
        </View>
      );
  }
};
