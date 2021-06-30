import * as React from 'react';
import { Shimmer, ShimmerElement } from '@fluentui-react-native/experimental-shimmer';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Stack } from '@fluentui-react-native/stack';
import { icon } from './iconImageSource';
import { stackStyle } from '../Common/styles';

const shimmer: React.FunctionComponent<{}> = () => {
  const lines: Array<ShimmerElement> = [
    {
      type: 'rect',
      width: 100,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 70,
    },
    {
      type: 'rect',
      width: 150,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 42,
    },
    {
      type: 'rect',
      width: 200,
      height: 20,
      borderRadius: 3,
      xPos: 90,
      yPos: 15,
    },
  ];
  const circle = lines.slice();
  circle.push({ type: 'circle', height: 70, xPos: 40, yPos: 55 });
  const rect = lines.slice();
  rect.push({ type: 'rect', height: 60, width: 60, xPos: 10, yPos: 25, borderRadius: 3 });

  const CustomizedShimmer = Shimmer.customize({
    gradientTintColor: 'pink',
  });
  return (
    <Stack style={stackStyle}>
      <CustomizedShimmer uri={icon} height={200} />
      <Shimmer elements={circle} width={500} />
      <Shimmer elements={rect} width={500} />
      <Shimmer height={10} />
    </Stack>
  );
};

const shimmerSections: TestSection[] = [
  {
    name: 'Basic Shimmer',
    testID: SHIMMER_TESTPAGE,
    component: shimmer,
  },
];

export const ShimmerTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Shimmer is a temporary animation placeholder for when a service call takes time to return data but the rest of the UI should continue rendering.';

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status}></Test>;
};
