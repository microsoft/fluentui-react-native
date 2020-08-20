import * as React from 'react';
import { Shimmer } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { SHIMMER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Text, View } from 'react-native';

const shimmer: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Shimmer>
        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', marginStart: 16, marginEnd: 16 }}>
          <View style={{ width: 40, height: 40 }} />
          <View style={{ flexDirection: 'column', flex: 2, marginLeft: 16 }}>
            <Text style={{ marginBottom: 3, width: '40%' }}>{''}</Text>
            <Text style={{ marginTop: 3, width: '30%' }}>{''}</Text>
          </View>
        </View>
      </Shimmer>
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
