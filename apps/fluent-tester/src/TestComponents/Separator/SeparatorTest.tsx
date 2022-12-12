import * as React from 'react';
import { Platform } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { Button } from '@fluentui-react-native/experimental-button';
import { Text } from '@fluentui-react-native/experimental-text';
import { stackStyle, separatorStackStyle, commonTestStyles } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { SEPARATOR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const BlueSeparator = Separator.customize({ color: 'blue' });
const RedSeparator = Separator.customize({ color: 'red' });

const SeparatorMainTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle} gap={5}>
      <Stack gap={4} style={separatorStackStyle}>
        <Button>Button1</Button>
        <BlueSeparator vertical />
        <Button>Button2</Button>
        <RedSeparator vertical />
        <Button>Button3 </Button>
        <Separator />
      </Stack>
      <Text>This is a text element</Text>
      <Separator />
      <Button>This button has longer text</Button>
    </Stack>
  );
};

const CustomisedText = Text.customize({
  textAlign: 'right',
  fontSize: 'caption',
});

const SeparatorAndroid: React.FunctionComponent = () => {
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

const separatorSections: TestSection[] = [
  ...Platform.select({
    android: [
      {
        name: 'Basic Mobile Seperator',
        testID: SEPARATOR_TESTPAGE,
        component: SeparatorAndroid,
      },
    ],
    default: [
      {
        name: 'Basic Seperator',
        testID: SEPARATOR_TESTPAGE,
        component: SeparatorMainTest,
      },
    ],
  }),
];

export const SeparatorTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description =
    "A separator visually separates content into groups.\n\nYou can render content in the separator by specifying the component's children. The component's children can be plain text or a component like Icon. The content is center-aligned by default.";

  return <Test name="Separator Test" description={description} sections={separatorSections} status={status} />;
};
