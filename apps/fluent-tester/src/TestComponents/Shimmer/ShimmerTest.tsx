import * as React from 'react';
import { Platform } from 'react-native';

import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { Stack } from '@fluentui-react-native/stack';

import { E2ETestingShimmer } from './ShimmerE2ETest';
import { shimmerBorderRadiusTests, shimmerRectsAndRect, shimmerRectsAndCircle } from './ShimmerTestElementSets';
import { SHIMMER_TESTPAGE } from '../../../../E2E/src/Shimmer/consts';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const TestCompareCustomizeShimmer = Shimmer.customize({
  shimmerWaveColor: 'blue',
  shimmerColor: 'orange',
  backgroundColor: 'red',
});

export const CustomizeAndTokenPropsShimmers: React.FunctionComponent = () => {
  return (
    <Stack style={{ margin: 4 }}>
      <TestCompareCustomizeShimmer
        elements={shimmerRectsAndCircle()}
        duration={2000}
        delay={1000}
        style={{ height: 100, width: '50%', borderWidth: 2, borderColor: 'black' }}
      />

      <Shimmer
        elements={shimmerRectsAndCircle()}
        duration={2000}
        delay={1000}
        style={{ height: 100, width: '50%', borderWidth: 2, borderColor: 'black' }}
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
        style={{ height: 100, width: 150, borderRadius: 16, borderWidth: 2, borderColor: 'black' }}
        backgroundColor="teal"
      />
    </Stack>
  );
};

const RectShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndRect()} style={{ width: 300, height: 100 }} />
    </Stack>
  );
};

const RectCircleShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndCircle()} duration={3000} delay={1000} style={{ width: 300, height: 100 }} />
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
      <Shimmer elements={shimmerBorderRadiusTests()} duration={3000} style={{ width: 800, height: 400 }} />
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
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Shimmer is a temporary animation placeholder for when a service call takes time to return data but the rest of the UI should continue rendering.';

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status} />;
};
