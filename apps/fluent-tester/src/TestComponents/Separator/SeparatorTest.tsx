import * as React from 'react';

import { ButtonV1 } from '@fluentui-react-native/button';
import { Text } from '@fluentui-react-native/experimental-text';
import { Separator } from '@fluentui-react-native/separator';
import { Stack } from '@fluentui-react-native/stack';

import { SEPARATOR_TESTPAGE } from '../../../../E2E/src/Separator/consts';
import { stackStyle, separatorStackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const BlueSeparator = Separator.customize({ color: 'blue' });
const RedSeparator = Separator.customize({ color: 'red' });

const SeparatorMainTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle} gap={5}>
      <Stack gap={4} style={separatorStackStyle}>
        <ButtonV1>Button1</ButtonV1>
        <BlueSeparator vertical />
        <ButtonV1>Button2</ButtonV1>
        <RedSeparator vertical />
        <ButtonV1>Button3 </ButtonV1>
        <Separator />
      </Stack>
      <Text>This is a text element</Text>
      <Separator />
      <ButtonV1>This button has longer text</ButtonV1>
    </Stack>
  );
};

const separatorSections: TestSection[] = [
  {
    name: 'Basic Seperator',
    testID: SEPARATOR_TESTPAGE,
    component: SeparatorMainTest,
  },
];

export const SeparatorTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Experimental',
  };

  const description =
    "A separator visually separates content into groups.\n\nYou can render content in the separator by specifying the component's children. The component's children can be plain text or a component like Icon. The content is center-aligned by default.";

  return <Test name="Separator Test" description={description} sections={separatorSections} status={status} />;
};
