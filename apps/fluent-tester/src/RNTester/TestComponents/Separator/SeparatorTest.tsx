import * as React from 'react';
import { Text } from 'react-native';
import { Button } from '@fluentui-react-native/button';
import { Separator } from '@fluentui-react-native/separator';
import { stackStyle, separatorStackStyle } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { SEPARATOR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const BlueSeparator = Separator.customize({ tokens: { color: 'blue' } });
const RedSeparator = Separator.customize({ tokens: { color: 'red' } });

const separator: React.FunctionComponent<{}> = () => {

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
}

const separatorSections: TestSection[] = [
  {
    name: 'Basic Button',
    testID: SEPARATOR_TESTPAGE,
    component: separator
  }
];

export const SeparatorTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'beta',
    uwpStatus: 'experimental',
    iosStatus: 'experimental',
    macosStatus: 'beta',
    androidStatus: 'backlog'
  }

  const description = "A separator visually separates content into groups.\n\nYou can render content in the separator by specifying the component's children. The component's children can be plain text or a component like Icon. The content is center-aligned by default."

  return (
    <Test name="Separator Test" description={description} sections={separatorSections} status={status}></Test>
  );
};