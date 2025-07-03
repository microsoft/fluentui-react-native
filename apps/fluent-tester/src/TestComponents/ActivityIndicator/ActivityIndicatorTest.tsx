import * as React from 'react';
import { View, Switch } from 'react-native';

import { Text } from '@fluentui/react-native';
import { ACTIVITY_INDICATOR_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const BasicActivityIndicator: React.FunctionComponent = () => {
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
        <ActivityIndicator animating={animating} hidesWhenStopped={hidesWhenStopped} />
      </View>
    </Stack>
  );
};

const ActivityIndicatorMainTest: React.FunctionComponent = () => {
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

      <Text>Size=xLarge and Line Thickness=large</Text>
      <ActivityIndicator size="xLarge" lineThickness="large" />
      <Text>Color props</Text>
      <ActivityIndicator activityIndicatorColor="orange" accessibilityLabel="orange progressbar" />
    </Stack>
  );
};

const CustomizedActivityIndicator = ActivityIndicator.customize({
  activityIndicatorColor: 'orange',
  size: 'large',
});

const CustomizedActivityIndicatorTest: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Text>Customized Activity Indicator</Text>
      <CustomizedActivityIndicator />
    </Stack>
  );
};

const activityIndicatorSections: TestSection[] = [
  {
    name: 'Base ActivityIndicator',
    testID: ACTIVITY_INDICATOR_TESTPAGE,
    component: BasicActivityIndicator,
  },
  {
    name: 'ActivityIndicator',
    testID: ACTIVITY_INDICATOR_TESTPAGE,
    component: ActivityIndicatorMainTest,
  },
  {
    name: 'Customized ActivityIndicator',
    testID: ACTIVITY_INDICATOR_TESTPAGE,
    component: CustomizedActivityIndicatorTest,
  },
];

export const ActivityIndicatorTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description =
    'ActivityIndicator is a visual representation that data is being loaded. It is implemented with a View wrapping an Animated SVG. The View is to ensure that AccessibilityRole works. AccessibilityRole currently does not work on SVGs.';

  return <Test name="ActivityIndicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};
