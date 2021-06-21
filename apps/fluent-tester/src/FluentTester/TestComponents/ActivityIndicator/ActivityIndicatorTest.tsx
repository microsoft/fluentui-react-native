import * as React from 'react';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ACTIVITYINDICATOR_TESTPAGE } from './consts';

const activityIndicatorTest: React.FunctionComponent<{}> = () => {

  return (
    <Stack style={stackStyle}>
      <Text>No Props</Text>
      <ActivityIndicator />
      <Text>Animating: False, hidesWhenStopped: False</Text>
      <ActivityIndicator animating={false} hidesWhenStopped={false}/>
      <Text>Animating: False</Text>
      <ActivityIndicator animating={false} />
    </Stack>
  );
};


const activityIndicatorSections: TestSection[] = [
  {
    name: 'ActivityIndicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: activityIndicatorTest,
  }
];

export const ActivityIndicatorTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'ActivityIndicator is a visual representation that data is being loaded. It is made by combining a 3/4 circle arc with 2 end circles for rounded edges.';

  return <Test name="ActivityIndicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};