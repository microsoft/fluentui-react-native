import * as React from 'react';
import { Spinner } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { SPINNER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const spinner: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Spinner size="xSmall" />
      <Spinner size="small" />
      <Spinner size="medium" />
      <Spinner size="large" />
      <Spinner size="xLarge" />
    </Stack>
  );
};

const stylizedSpinner: React.FunctionComponent<{}> = () => {
  const CustomizedSpinner = Spinner.customize({
    color: 'blue',
  });

  return (
    <Stack style={stackStyle}>
      <CustomizedSpinner size="xSmall" />
      <CustomizedSpinner size="small" animating={false} />
      <CustomizedSpinner size="medium" />
      <CustomizedSpinner size="large" animating={false} />
      <CustomizedSpinner size="xLarge" />
    </Stack>
  );
};

const spinnerSections: TestSection[] = [
  {
    name: 'Basic Spinner',
    testID: SPINNER_TESTPAGE,
    component: spinner,
  },
  {
    name: 'Stylized Spinner',
    testID: SPINNER_TESTPAGE,
    component: stylizedSpinner,
  },
];

export const SpinnerTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'A Spinner is an outline of a circle which animates around itself indicating to the user that things are processing. A Spinner is shown when its unsure how long a task will take making it the indeterminate version of a ProgressIndicator. They can be various sizes, located inline with content or centered. They generally appear after an action is being processed or committed. They are subtle and generally do not take up much space, but are transitions from the completed task.';

  return <Test name="Spinner Test" description={description} sections={spinnerSections} status={status}></Test>;
};
