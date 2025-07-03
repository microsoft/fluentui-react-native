import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import { DIVIDER_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { CustomisedMobileDividers, MobileDividers } from './MobileDividerTest';
import TestSvg from '../../../assets/test.svg';
import { commonTestStyles } from '../Common/styles';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';
const PaddedDivider = Divider.customize({ paddingVertical: 4, thickness: 2 });
const CustomText = Text.customize({ margin: 8 });

const ColoredDivider = Divider.customize({ contentColor: '#bf5700', lineColor: '#bf5700' });
const ThickDivider = Divider.customize({ thickness: 3 });
const TextVariantDivider = Divider.customize({ variant: 'subtitle2Strong' });
const StyledTextDivider = Divider.customize({ fontSize: 10, fontStyle: 'italic', textDecorationLine: 'underline' });

const dividerTestStyles = StyleSheet.create({
  verticalDividerContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  horizontalDividerContainer: {
    height: 120,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
});

export const HorizontalDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <CustomText>Regular divider with no content below.</CustomText>
    <Divider />
    <CustomText>Regular divider with no content above.</CustomText>
    <Divider>Divider with text content.</Divider>
    <Divider insetSize={16}>Divider with text + inset.</Divider>
    <PaddedDivider alignContent="start">I am a start-aligned divider</PaddedDivider>
    <PaddedDivider alignContent="end">I am a end-aligned divider</PaddedDivider>
  </Stack>
);

export const VerticalDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <View style={dividerTestStyles.verticalDividerContainer}>
      <CustomText>Regular divider {'->'}</CustomText>
      <Divider vertical />
      <CustomText>Divider with an inset {'->'}</CustomText>
      <Divider vertical insetSize={16} />
      <PaddedDivider vertical>Divider with text</PaddedDivider>
      <Divider vertical alignContent="start">
        Start-aligned divider
      </Divider>
      <Divider vertical alignContent="end">
        End-aligned divider
      </Divider>
    </View>
    <Divider />
    <View style={dividerTestStyles.verticalDividerContainer}>
      <CustomText>The divider to the right of me should have a min height of 20px</CustomText>
      <Divider vertical />
      <CustomText>The divider to the left of me should have a min height of 20px</CustomText>
    </View>
  </Stack>
);

export const DividersWithAppearance: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <PaddedDivider appearance="default">Default divider</PaddedDivider>
    <PaddedDivider appearance="subtle">Subtle divider</PaddedDivider>
    <PaddedDivider appearance="brand">Branded divider</PaddedDivider>
    <PaddedDivider appearance="strong">Strong divider</PaddedDivider>
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

export const CustomDividers: React.FunctionComponent = () => (
  <Stack style={commonTestStyles.stack}>
    <View style={dividerTestStyles.horizontalDividerContainer}>
      <ColoredDivider>Divider with color</ColoredDivider>
      <ThickDivider>Divider with thickness</ThickDivider>
      <TextVariantDivider>Divider with text variant</TextVariantDivider>
      <StyledTextDivider>Divider with text styling</StyledTextDivider>
    </View>
    <View style={dividerTestStyles.verticalDividerContainer}>
      <ColoredDivider vertical>Divider with color</ColoredDivider>
      <ThickDivider vertical>Divider with thickness</ThickDivider>
      <TextVariantDivider vertical>Divider with text variant</TextVariantDivider>
      <StyledTextDivider vertical>Divider with text styling</StyledTextDivider>
    </View>
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
    name: 'Custom Dividers',
    component: CustomDividers,
  },
  {
    name: 'Dividers with Icons',
    component: DividersWithIcons,
  },
];

const mobileDividerSections: TestSection[] = [
  {
    name: 'Mobile Dividers',
    testID: DIVIDER_TESTPAGE,
    component: MobileDividers,
  },
  {
    name: 'Customised Mobile Dividers',
    testID: DIVIDER_TESTPAGE,
    component: CustomisedMobileDividers,
  },
];

export const DividerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'A Divider is a visual separator that can contain content (text or an icon). Dividers can be horizontal or vertical';
  const mobileDescription = 'A Divider is a visual horizontal separator that seperates content/sections';
  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Divider/SPEC.md';

  return (
    <Test
      name="Divider Test"
      description={isMobile ? mobileDescription : description}
      sections={isMobile ? mobileDividerSections : dividerSections}
      spec={spec}
      status={status}
    ></Test>
  );
};
