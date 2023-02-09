import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Divider } from '@fluentui-react-native/divider';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { DIVIDER_TESTPAGE } from './consts';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';
import { commonTestStyles } from '../Common/styles';
import TestSvg from '../../../assets/test.svg';

const CustomDivider = Divider.customize({ thickness: 3, paddingVertical: 4 });
const CustomText = Text.customize({ margin: 8 });

const RedDivider = Divider.customize({ contentColor: 'red', lineColor: 'red' });

const dividerTestStyles = StyleSheet.create({
  verticalDividerContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export const HorizontalDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <CustomText>Regular divider with no content below.</CustomText>
    <Divider />
    <CustomText>Regular divider with no content above.</CustomText>
    <Divider>Divider with text content.</Divider>
    <Divider insetSize={16}>Colored divider with text + inset.</Divider>
    <CustomDivider alignContent="start">I am a start-aligned divider with a thickness = 3</CustomDivider>
    <CustomDivider alignContent="end">I am a end-aligned divider with a thickness = 3</CustomDivider>
  </Stack>
);

export const VerticalDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <View style={dividerTestStyles.verticalDividerContainer}>
      <CustomText>Regular divider {'->'}</CustomText>
      <Divider vertical />
      <CustomText>Divider with an inset {'->'}</CustomText>
      <Divider vertical insetSize={16} />
      <CustomDivider vertical>Thick divider with text</CustomDivider>
      <RedDivider vertical alignContent="start">
        Start-aligned divider
      </RedDivider>
      <Divider vertical alignContent="end">
        End-aligned divider
      </Divider>
    </View>
    <Divider />
    <View style={dividerTestStyles.verticalDividerContainer}>
      <CustomText>The divider to the right of me should have a min height of 24px</CustomText>
      <Divider vertical />
      <CustomText>The divider to the left of me should have a min height of 24px</CustomText>
    </View>
  </Stack>
);

export const DividersWithAppearance: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <CustomDivider appearance="default">Default divider</CustomDivider>
    <CustomDivider appearance="subtle">Subtle divider</CustomDivider>
    <CustomDivider appearance="brand">Branded divider</CustomDivider>
    <CustomDivider appearance="strong">Strong divider</CustomDivider>
  </Stack>
);

export const DividersWithIcons: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <Divider appearance="brand" icon={{ fontSource: { fontFamily: 'Arial', codepoint: 0x2663, fontSize: 32 } }} />
    <CustomText align="center">
      Above is a branded Divider with a font icon as content. Below me is a branded divider with an svg icon as content - this will not show
      on UWP.
    </CustomText>
    {Platform.OS !== 'windows' && (
      <Divider appearance="brand" icon={{ svgSource: { viewBox: '0 0 500 500', src: TestSvg, width: 32, height: 32 } }} />
    )}
  </Stack>
);

const dividerSections: TestSection[] = [
  {
    name: 'Horizontal Dividers',
    testID: DIVIDER_TESTPAGE,
    component: HorizontalDividers,
  },
  {
    name: 'Vertical Dividers',
    component: VerticalDividers,
  },
  {
    name: 'Divider Appearances',
    component: DividersWithAppearance,
  },
  {
    name: 'Dividers with Icons',
    component: DividersWithIcons,
  },
];

export const DividerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description =
    'A Divider is a visual separator that can contain content (text or an icon). Dividers can be horizontal or vertical. As of now, the component is being designed for win32 only.';

  return <Test name="Divider Test" description={description} sections={dividerSections} status={status}></Test>;
};
