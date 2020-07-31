import * as React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { stackStyle, separatorStackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { SEPARATOR_TESTPAGE } from './consts';

const BlueSeparator = Separator.customize({ tokens: { color: 'blue' } });
const RedSeparator = Separator.customize({ tokens: { color: 'red' } });

export const SeparatorTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <Text style={commonStyles.section} testID={SEPARATOR_TESTPAGE}>
        Separator Test Page
      </Text>
      <Separator />
      <Stack style={stackStyle} gap={5}>
        <Stack gap={4} style={separatorStackStyle}>
          <Button content="Button4" />
          <BlueSeparator vertical />
          <Button content="Button5" />
          <RedSeparator vertical />
          <Button content="Button6" />
          <Separator />
        </Stack>
        <Text>This is a text element</Text>
        <Separator />
        <Button content="This button has longer text" />
      </Stack>
    </View>
  );
};