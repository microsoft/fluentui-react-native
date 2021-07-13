import * as React from 'react';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ACTIVITYINDICATOR_TESTPAGE } from './consts';
import { View, Switch } from 'react-native';

const activityIndicatorTest: React.FunctionComponent<{}> = () => {
  /** Customize doesn't do anything
   * Tried having tokens not be props, but didn't work
   * Not sure how to test/check where the tokens are passed through other than just looking at the final render
   */
  const CustomizedActivityIndicator = ActivityIndicator.customize({
    activityIndicatorColor: 'orange',
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

      <Text>Size=xLarge and Line Thickness=large</Text>
      <ActivityIndicator size="xLarge" lineThickness="large" />
      <Text>Color props</Text>
      <ActivityIndicator activityIndicatorColor="orange" accessibilityLabel="orange progressbar" />
      <Text>Customized Activity Indicator (currently not working)</Text>
      <CustomizedActivityIndicator />
    </Stack>
  );
};

const basicActivityIndicator: React.FunctionComponent<{}> = () => {
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

const activityIndicatorSections: TestSection[] = [
  {
    name: 'BaseActivityIndicator',
    testID: ACTIVITYINDICATOR_TESTPAGE,
    component: basicActivityIndicator,
  },
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
    iosStatus: 'Beta',
    macosStatus: 'Backlog',
    androidStatus: 'Beta',
  };

  const description =
    'ActivityIndicator is a visual representation that data is being loaded. It is implemented with a View wrapping an Animated SVG. The View is to ensure that AccessibilityRole works. AccessibilityRole currently does not work on SVGs.';

  return <Test name="ActivityIndicator Test" description={description} sections={activityIndicatorSections} status={status}></Test>;
};
