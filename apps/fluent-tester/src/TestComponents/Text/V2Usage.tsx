import * as React from 'react';
import { Platform, Text, View } from 'react-native';
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
  Title1,
  Title2,
  Title3,
} from '@fluentui-react-native/text';

export const V2Usage: React.FunctionComponent = () => {
  if (Platform.OS === 'ios') {
    return (
      <View>
        <Stack style={stackStyle} gap={5}>
          <Caption2>Caption2</Caption2>
          <Caption1>Caption1</Caption1>
          <Caption1Strong>Caption1Strong</Caption1Strong>
          <Body2>Body2</Body2>
          <Body2Strong>Body2Strong</Body2Strong>
          <Body1>Body1</Body1>
          <Body1Strong>Body1Strong</Body1Strong>
          <Title3>Title3</Title3>
          <Title2>Title2</Title2>
          <Title1>Title1</Title1>
          <LargeTitle>LargeTitle</LargeTitle>
          <Display>Display</Display>
        </Stack>
      </View>
    );
  } else {
    return <Text>Only available on iOS for now.</Text>;
  }
};
