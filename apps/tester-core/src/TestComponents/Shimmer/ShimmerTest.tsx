import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { SHIMMER_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { Stack } from '@fluentui-react-native/stack';

import { E2ETestingShimmer } from './ShimmerE2ETest';
import { shimmerBorderRadiusTests, shimmerRectsAndRect, shimmerRectsAndCircle } from './ShimmerTestElementSets';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const TestCompareCustomizeShimmer = Shimmer.customize({
  shimmerWaveColor: 'blue',
  shimmerColor: 'orange',
  backgroundColor: 'red',
});

const shimmerStyles = StyleSheet.create({
  smallCustomizedShimmer: { height: 100, width: '50%', borderWidth: 2, borderColor: 'black' },
  smallRoundedCustomizedShimmer: { height: 100, width: 150, borderRadius: 20, borderWidth: 2, borderColor: 'black' },
  mediumShimmer: { width: 300, height: 100 },
  largeShimmer: { width: 800, height: 400 },
});

export const CustomizeAndTokenPropsShimmers: React.FunctionComponent = () => {
  return (
    <Stack style={{ margin: 4 }}>
      <TestCompareCustomizeShimmer
        elements={shimmerRectsAndCircle()}
        duration={2000}
        delay={1000}
        style={shimmerStyles.smallCustomizedShimmer}
      />

      <Shimmer
        elements={shimmerRectsAndCircle()}
        duration={2000}
        delay={1000}
        style={shimmerStyles.smallCustomizedShimmer}
        shimmerWaveColor="blue"
        shimmerColor="orange"
        backgroundColor="red"
      />
    </Stack>
  );
};

export const RoundedCornerClipCheckShimmer: React.FunctionComponent = () => {
  return (
    <Stack style={{ margin: 4 }}>
      <Shimmer
        elements={shimmerRectsAndCircle()}
        duration={2000}
        delay={1000}
        style={shimmerStyles.smallRoundedCustomizedShimmer}
        backgroundColor="teal"
      />
    </Stack>
  );
};

const RectShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndRect()} style={shimmerStyles.mediumShimmer} />
    </Stack>
  );
};

const RectCircleShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndCircle()} duration={3000} delay={1000} style={shimmerStyles.mediumShimmer} />
    </Stack>
  );
};

const CustomizedShimmer: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <CustomizeAndTokenPropsShimmers />
      <RoundedCornerClipCheckShimmer />
    </Stack>
  );
};

const ShimmerBorderRadii: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerBorderRadiusTests()} duration={3000} style={shimmerStyles.largeShimmer} />
    </Stack>
  );
};

const shimmerSections: TestSection[] = [
  {
    name: 'Shimmer Rects',
    testID: SHIMMER_TESTPAGE,
    component: RectShimmers,
  },
  {
    name: 'Shimmer Rects and Circle',
    testID: SHIMMER_TESTPAGE,
    component: RectCircleShimmers,
  },
  ...Platform.select({
    android: [null],
    default: [
      {
        name: 'Border Radius Tests',
        testID: SHIMMER_TESTPAGE,
        component: ShimmerBorderRadii,
      },
      {
        name: 'Customized Shimmer',
        testID: SHIMMER_TESTPAGE,
        component: CustomizedShimmer,
      },
    ],
  }),
  {
    name: 'Shimmer for E2E Testing',
    component: E2ETestingShimmer,
  },
];

export const ShimmerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'Shimmer is a temporary animation placeholder for when a service call takes time to return data but the rest of the UI should continue rendering.';

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status} />;
};
