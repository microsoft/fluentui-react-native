import * as React from 'react';
import { View, Switch } from 'react-native';

import { SPINNER_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import type { SpinnerStatus } from '@fluentui-react-native/spinner';
import { Spinner } from '@fluentui-react-native/spinner';
import { Stack } from '@fluentui-react-native/stack';
import { Text, TextV1 } from '@fluentui-react-native/text';

import { E2ETestingSpinner } from './SpinnerE2ETest';
import { stackStyle, commonTestStyles as commonStyles, commonTestStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const BasicSpinnerTest: React.FunctionComponent = () => {
  const [status, setStatus] = React.useState<SpinnerStatus>('active');
  const [hidesWhenStopped, setHidesWhenStopped] = React.useState(true);

  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <View style={commonStyles.settings}>
          <View style={commonStyles.switch}>
            <Text>Animating</Text>
            <Switch
              value={status === 'active'}
              onValueChange={(value) => {
                value ? setStatus('active') : setStatus('inactive');
              }}
            />
          </View>
          <View style={commonStyles.switch}>
            <Text>HidesWhenStopped</Text>
            <Switch value={hidesWhenStopped} onValueChange={setHidesWhenStopped} />
          </View>
        </View>
        <Spinner status={status} hidesWhenStopped={hidesWhenStopped} />
      </View>
    </Stack>
  );
};

const CustomisedSpinner = Spinner.customize({
  trackColor: 'red',
  size: 'medium',
});

const SpinnerSizeTest: React.FunctionComponent = () => {
  const memoizedStyles = React.useMemo(() => ({ ...commonTestStyles.androidContainer, height: 250 }), []);
  return (
    <Stack style={stackStyle}>
      <View style={memoizedStyles}>
        <View>
          <TextV1>xx-small</TextV1>
          <Spinner size="xx-small" />
        </View>
        <View>
          <TextV1>x-small</TextV1>
          <Spinner size="x-small" />
        </View>
        <View>
          <TextV1>medium</TextV1>
          <Spinner size="medium" />
        </View>
        <View>
          <TextV1>large</TextV1>
          <Spinner size="large" />
        </View>
        <View>
          <TextV1>x-large</TextV1>
          <Spinner size="x-large" />
        </View>
      </View>
    </Stack>
  );
};

const spinnerSections: TestSection[] = [
  {
    name: 'Basic Spinner',
    testID: SPINNER_TESTPAGE,
    component: BasicSpinnerTest,
  },
  {
    name: 'Spinner Size Test',
    component: SpinnerSizeTest,
  },
  {
    name: 'Customized Spinner Test',
    component: () => <CustomisedSpinner />,
  },
  {
    name: 'Spinner for E2E Testing',
    component: () => <E2ETestingSpinner />,
  },
];

export const SpinnerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'Spinner is a visual representation that data is being loaded. It is implemented with a View wrapping an Animated SVG. The View is to ensure that AccessibilityRole works. AccessibilityRole currently does not work on SVGs.';

  return <Test name="Spinner Test" description={description} sections={spinnerSections} status={status}></Test>;
};
