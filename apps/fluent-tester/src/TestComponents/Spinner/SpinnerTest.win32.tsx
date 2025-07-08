import * as React from 'react';
import { View /*Switch */ } from 'react-native';

//import type { SpinnerStatus } from '@fluentui-react-native/spinner';
import { SPINNER_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Spinner } from '@fluentui-react-native/spinner';
import { Stack } from '@fluentui-react-native/stack';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { E2ETestingSpinner } from './SpinnerE2ETest';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const BasicSpinnerTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <View style={commonStyles.settings}></View>
        <Spinner />
      </View>
    </Stack>
  );
};

const SpinnerSizeTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <View>
        <View>
          <Text>tiny</Text>
          <Spinner size="tiny" />
        </View>
        <View>
          <Text>x-small</Text>
          <Spinner size="x-small" />
        </View>
        <View>
          <Text>small</Text>
          <Spinner size="small" />
        </View>
        <View>
          <Text>medium</Text>
          <Spinner size="medium" />
        </View>
        <View>
          <Text>large</Text>
          <Spinner size="large" />
        </View>
        <View>
          <Text>x-large</Text>
          <Spinner size="x-large" />
        </View>
        <View>
          <Text>huge</Text>
          <Spinner size="huge" />
        </View>
      </View>
    </Stack>
  );
};

const spinnerSections: TestSection[] = [
  {
    name: 'Basic Spinner Test',
    testID: SPINNER_TESTPAGE,
    component: BasicSpinnerTest,
  },
  {
    name: 'Spinner Size Test',
    component: SpinnerSizeTest,
  },
  {
    name: 'Spinner for E2E Testing',
    component: () => <E2ETestingSpinner />,
  },
];

export const SpinnerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'Spinner is a visual representation that data is being loaded. It is implemented with a View wrapping an Animated SVG. The View is to ensure that AccessibilityRole works. AccessibilityRole currently does not work on SVGs.';

  return <Test name="Spinner Test" description={description} sections={spinnerSections} status={status}></Test>;
};
