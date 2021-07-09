import * as React from 'react';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ACTIVITYINDICATOR_TESTPAGE } from './consts';

const activityIndicatorTest: React.FunctionComponent<{}> = () => {
  /** Bug: Customize doesn't do anything
   * Tried having tokens not be props, but didn't work
   * Not sure how to test/check where the tokens are passed through other than just looking at the final render
   */
  const CustomizedActivityIndicator = ActivityIndicator.customize({
    activityIndicatorColor: '#458792',
  });
  return (
    <Stack style={stackStyle}>
      <Text>Extra Small</Text>
      <ActivityIndicator size="xSmall" />
      <Text>Small</Text>
      <ActivityIndicator size="small" />
      <Text>Medium</Text>
      <ActivityIndicator size="medium" />
      <Text>Large</Text>
      <ActivityIndicator size="large" />
      <Text>Extra Large</Text>
      <ActivityIndicator size="xLarge" />

      <Text>Size and Line Thickness props of different sizes</Text>
      <ActivityIndicator size="xLarge" lineThickness="large" />
      <Text>Color props</Text>
      <ActivityIndicator activityIndicatorColor="#921571" />
      <Text>Animating: False, hidesWhenStopped: False</Text>
      <ActivityIndicator animating={false} hidesWhenStopped={false} />
      <Text>Animating: False</Text>
      <ActivityIndicator animating={false} />
      <Text>Customized Activity Indicator (currently not working)</Text>
      <CustomizedActivityIndicator />
    </Stack>
  );
};

const activityIndicatorSections: TestSection[] = [
  {
    name: 'ActivityIndicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: activityIndicatorTest,
  },
];

export const ActivityIndicatorTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'ActivityIndicator is a visual representation that data is being loaded. It is made with an Animated SVG.';

  return <Test name="ActivityIndicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};
