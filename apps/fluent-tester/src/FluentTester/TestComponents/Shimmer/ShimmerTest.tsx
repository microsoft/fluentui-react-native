import * as React from 'react';
import { Shimmer } from '@fluentui-react-native/experimental-shimmer';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { shimmerBorderRadiusTests, shimmerRectsAndRect, shimmerRectsAndCircle } from './ShimmerTestElementSets';

const RectShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndRect()} duration={2000} delay={1000} style={{ width: 300, height: 100 }} />
    </Stack>
  );
};

const RectCircleShimmers: React.FunctionComponent<Record<string, never>> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer elements={shimmerRectsAndCircle()} duration={3000} style={{ width: 300, height: 100 }} />
    </Stack>
  );
};

const CustomizedShimmer: React.FunctionComponent<Record<string, never>> = () => {
  const PinkShimmer = Shimmer.customize({
    shimmerWaveColor: 'pink',
  });

  return (
    <Stack style={stackStyle}>
      <PinkShimmer elements={shimmerRectsAndCircle()} duration={1500} delay={500} style={{ height: 100, maxWidth: '50%' }} />
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
    name: 'Customized Shimmer',
    testID: SHIMMER_TESTPAGE,
    component: CustomizedShimmer,
  },
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
  {
    name: 'Border Radius Tests',
    testID: SHIMMER_TESTPAGE,
    component: ShimmerBorderRadii,
  },
];

export const ShimmerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Shimmer is a temporary animation placeholder for when a service call takes time to return data but the rest of the UI should continue rendering.';

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status} />;
};
