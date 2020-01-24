import * as React from 'react';
import { Button, Stack, Separator, Text } from '../components';
import { stackStyle, separatorStackStyle } from './TesterStyles';

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
      <Text>This is a text element</Text>
      <Separator />
      <Button content="This button has longer text" />
    </Stack>
  );
};
