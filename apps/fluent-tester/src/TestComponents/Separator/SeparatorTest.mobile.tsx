import * as React from 'react';

import { SEPARATOR_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Separator } from '@fluentui-react-native/separator';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { commonTestStyles, mobileStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const CustomisedText = Text.customize({
  textAlign: 'right',
  fontSize: 'caption',
});

const SeparatorBasicUsage: React.FunctionComponent = () => {
  return (
    <Stack style={commonTestStyles.section} gap={5}>
      <Separator insetSpacing={0} />
      <CustomisedText>Inset : 0</CustomisedText>

      <Separator insetSpacing={16} />
      <CustomisedText>Inset : 16</CustomisedText>

      <Separator insetSpacing={56} />
      <CustomisedText>Inset : 56</CustomisedText>

      <Separator insetSpacing={68} />
      <CustomisedText>Inset : 68</CustomisedText>

      <Separator insetSpacing={72} />
      <CustomisedText>Inset : 72</CustomisedText>

      <Separator insetSpacing={108} />
      <CustomisedText>Inset : 108</CustomisedText>
    </Stack>
  );
};

const RedSeparator = Separator.customize({ color: 'red' });
const BlueSeparatorWithCustomWidth = Separator.customize({ color: 'blue', separatorWidth: 10 });

const SeparatorCustomisedUsage: React.FunctionComponent = () => {
  return (
    <Stack style={mobileStyles.testSection} gap={5}>
      <RedSeparator />
      <CustomisedText>Customised Color Seperator</CustomisedText>
      <BlueSeparatorWithCustomWidth insetSpacing={16} />
      <CustomisedText>Customised Color and Width Seperator</CustomisedText>
    </Stack>
  );
};

const separatorSections: TestSection[] = [
  {
    name: 'Basic Mobile Seperator',
    testID: SEPARATOR_TESTPAGE,
    component: SeparatorBasicUsage,
  },
  {
    name: 'Customised Mobile Seperator',
    testID: SEPARATOR_TESTPAGE,
    component: SeparatorCustomisedUsage,
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
