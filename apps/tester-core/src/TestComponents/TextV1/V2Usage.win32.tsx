import * as React from 'react';
import { View } from 'react-native';

import { Stack } from '@fluentui-react-native/stack';
import {
  Body1,
  Body1Strong,
  Body2,
  Body2Strong,
  Caption1,
  Display,
  LargeTitle,
  Subtitle1,
  Subtitle1Strong,
  Subtitle2,
  Subtitle2Strong,
  Title1,
  Title1Strong,
} from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';

export const V2Usage: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Caption1>Caption1</Caption1>
        <Body1>Body1</Body1>
        <Body1Strong>Body1Strong</Body1Strong>
        <Body2>Body2</Body2>
        <Body2Strong>Body2Strong</Body2Strong>
        <Subtitle2>Subtitle2</Subtitle2>
        <Subtitle2Strong>Subtitle2Strong</Subtitle2Strong>
        <Subtitle1>Subtitle1</Subtitle1>
        <Subtitle1Strong>Subtitle1Strong</Subtitle1Strong>
        <Title1>Title1</Title1>
        <Title1Strong>Title1Strong</Title1Strong>
        <LargeTitle>LargeTitle</LargeTitle>
        <Display>Display</Display>
      </Stack>
    </View>
  );
};
