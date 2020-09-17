import * as React from 'react';
import { ActivityIndicator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { ACTIVITYINDICATOR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const activityIndicator: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <ActivityIndicator size="xSmall" />
      <ActivityIndicator size="small" />
      <ActivityIndicator size="medium" />
      <ActivityIndicator size="large" />
      <ActivityIndicator size="xLarge" />
    </Stack>
  );
};

const stylizedActivityIndicator: React.FunctionComponent<{}> = () => {
  const CustomizedActivityIndicator = ActivityIndicator.customize({
    color: 'blue',
  });

  return (
    <Stack style={stackStyle}>
      <CustomizedActivityIndicator size="xSmall" />
      <CustomizedActivityIndicator size="small" animating={false} />
      <CustomizedActivityIndicator size="medium" />
      <CustomizedActivityIndicator size="large" animating={false} />
      <CustomizedActivityIndicator size="xLarge" />
    </Stack>
  );
};

const activityIndicatorSections: TestSection[] = [
  {
    name: 'Basic Activity Indicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: activityIndicator,
  },
  {
    name: 'Stylized Activity Indicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: stylizedActivityIndicator,
  },
];

export const ActivityIndicatorTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'An Activity Indicator';

  return <Test name="Activity Indicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};
