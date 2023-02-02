import * as React from 'react';
import { Text } from '@fluentui-react-native/text';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';
import { SPINNER_TESTPAGE } from '../../../../E2E/src/Spinner/consts';
import { View, Switch } from 'react-native';
import { Spinner } from '@fluentui-react-native/spinner';

const BasicSpinnerTest: React.FunctionComponent = () => {
  const [animating, setAnimating] = React.useState(true);
  const [hidesWhenStopped, setHidesWhenStopped] = React.useState(true);

  return (
    <Stack style={stackStyle}>
      <View style={commonStyles.root}>
        <View style={commonStyles.settings}>
          <View style={commonStyles.switch}>
            <Text>Animating</Text>
            <Switch value={animating} onValueChange={setAnimating} />
          </View>
          <View style={commonStyles.switch}>
            <Text>HidesWhenStopped</Text>
            <Switch value={hidesWhenStopped} onValueChange={setHidesWhenStopped} />
          </View>
        </View>
        <Spinner animating={animating} hidesWhenStopped={hidesWhenStopped} />
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
];

export const SpinnerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'SpinnerTest is a visual representation that data is being loaded. It is implemented with a View wrapping an Animated SVG. The View is to ensure that AccessibilityRole works. AccessibilityRole currently does not work on SVGs.';

  return <Test name="SpinnerTest Test" description={description} sections={spinnerSections} status={status}></Test>;
};
