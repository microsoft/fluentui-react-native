import * as React from 'react';
import { Text, View } from 'react-native';

import { Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { Caption1, Title2, Title3 } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';

const maximumFontSizeStyle = { maximumFontSize: 36 };

const CappedTitle2 = Title2.customize(maximumFontSizeStyle);
const CappedTitle3 = Title3.customize(maximumFontSizeStyle);

export const MaximumFontSizeUsage: React.FunctionComponent = () => {
  return (
    <View>
      <Stack style={stackStyle} gap={5}>
        <Caption1>Play with the preferred content size. The marked elements should not grow larger than 36 points.</Caption1>
        <Separator />
        <Title2>Title2</Title2>
        <Title3>Title3</Title3>
        <CappedTitle2>Title2 (capped)</CappedTitle2>
        <CappedTitle3>Title3 (capped)</CappedTitle3>
        <Text allowFontScaling={false} style={{ fontSize: 36, fontWeight: '600' }}>
          This is 36 pt
        </Text>
      </Stack>
    </View>
  );
};
