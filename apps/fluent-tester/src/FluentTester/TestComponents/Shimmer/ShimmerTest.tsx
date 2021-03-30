import * as React from 'react';
import { Shimmer } from '@fluentui/react-native';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const shimmer: React.FunctionComponent<{}> = () => {
  return (

      <Shimmer>
      </Shimmer>

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
