import * as React from 'react';
import { Button } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { Text } from '@fluentui-react-native/text';
import { stackStyle, separatorStackStyle } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { SEPARATOR_TESTPAGE } from './consts';

const BlueSeparator = Separator.customize({ tokens: { color: 'blue' } });
const RedSeparator = Separator.customize({ tokens: { color: 'red' } });

export const SeparatorTest: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle} gap={5}>
      <Stack gap={4} style={separatorStackStyle}>
        <Button content="Button4" />
        <BlueSeparator vertical />
        <Button content="Button5" />
        <RedSeparator vertical />
        <Button content="Button6" />
        <Separator />
      </Stack>
      <Text testID={SEPARATOR_TESTPAGE}>This is a text element</Text>
      <Separator />
      <Button content="This button has longer text" />
    </Stack>
  );
};
