import * as React from 'react';
import { Shimmer, ShimmerElement } from '@fluentui-react-native/experimental-shimmer';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import Svg, { Circle, ClipPath, Defs, LinearGradient, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

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

  return (
    <Stack style={stackStyle}>
      <Shimmer elements={rect} width={500} height={500} />
      <Shimmer height={150} width={150} />
    </Stack>
  );
};

const linearGradient: React.FunctionComponent<{}> = () => {
  return (
    <Svg height="100" width="100">
      <Defs>
        <LinearGradient id="gradient">
          <Stop offset="10%" stopColor="green" />
          <Stop offset="20%" stopColor="red" />
          <Stop offset="30%" stopColor="blue" />
        </LinearGradient>
        <ClipPath id="pat">
          <Circle cx="30" cy="30" r="20" />
          {/* <Ellipse cx="60" cy="70" rx="20" ry="10" /> */}
          <Rect x="65" y="15" width="30" height="30" />
          <Polygon points="20,60 20,80 50,70" />
        </ClipPath>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill="url(#gradient)" clipPath="url(#pat)" />
    </Svg>
  );
};

const shimmerSections: TestSection[] = [
  {
    name: 'Basic Shimmer',
    testID: SHIMMER_TESTPAGE,
    component: shimmer,
  },
  {
    name: 'Linear Gradient',
    component: linearGradient,
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

  return <Test name="Shimmer Test" description={description} sections={shimmerSections} status={status} />;
};
