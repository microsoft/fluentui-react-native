import * as React from 'react';
import { View } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import {
  Body1,
  Body1Strong,
  Body2,
  Body2Strong,
  Caption1,
  Caption1Strong,
  Caption2,
  Display,
  LargeTitle,
  TextV1,
  Title1,
  Title2,
  Title3,
} from '@fluentui-react-native/text';

export const V2Usage: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Caption2>Caption2</Caption2>
        <TextV1 variant="caption2">Caption2</TextV1>
        <Caption1>Caption1</Caption1>
        <TextV1 variant="caption1">Caption1</TextV1>
        <Caption1Strong>Caption1Strong</Caption1Strong>
        <TextV1 variant="caption1Strong">Caption1Strong</TextV1>
        <Body2>Body2</Body2>
        <TextV1 variant="body2">Body2</TextV1>
        <Body2Strong>Body2Strong</Body2Strong>
        <TextV1 variant="body2Strong">Body2Strong</TextV1>
        <Body1>Body1</Body1>
        <TextV1 variant="body1">Body1</TextV1>
        <Body1Strong>Body1Strong</Body1Strong>
        <TextV1 variant="body1Strong">Body1Strong</TextV1>
        <Title3>Title3</Title3>
        <TextV1 variant="title3">Title3</TextV1>
        <Title2>Title2</Title2>
        <TextV1 variant="title2">Title2</TextV1>
        <Title1>Title1</Title1>
        <TextV1 variant="title1">Title1</TextV1>
        <LargeTitle>LargeTitle</LargeTitle>
        <TextV1 variant="largeTitle">LargeTitle</TextV1>
        <Display>Display</Display>
        <TextV1 variant="display">Display</TextV1>
      </Stack>
    </View>
  );
};
