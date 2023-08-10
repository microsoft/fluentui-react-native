import * as React from 'react';
import { View, Switch, PlatformColor } from 'react-native';

import { Text } from '@fluentui/react-native';
import { ActivityIndicator } from '@fluentui-react-native/experimental-activity-indicator';
import { Stack } from '@fluentui-react-native/stack';
import { VibrancyView } from '@fluentui-react-native/vibrancy-view';

import { ACTIVITY_INDICATOR_TESTPAGE } from '../../../../E2E/src/ActivityIndicator/consts';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';
import { width } from '@fortawesome/free-solid-svg-icons/faMountainCity';

const BasicActivityIndicator: React.FunctionComponent = () => {
  const [animating, setAnimating] = React.useState(true);
  const [hidesWhenStopped, setHidesWhenStopped] = React.useState(true);

  return (
    <Stack style={stackStyle}>
      <View style={[commonStyles.root, { width: 80, height: 500, backgroundColor: 'black' }]}>
        <VibrancyView
          material={'menu'}
          blendingMode={'behindWindow'}
          style={{ width: 200, height: 400, borderColor: 'red', borderWidth: 1, borderRadius: 8 }}
        >
          {/* <VisualEffectView
            allowsVibrancy={true}
            behindWindow={false}
            material={'popover'}
            style={{ width: 200, height: 150, borderColor: 'red', borderWidth: 1, borderRadius: 8 }}
          > */}
          <View allowsVibrancy={true} style={[commonStyles.root, { width: 150, height: 100, backgroundColor: 'blue' }]}>
            <View allowsVibrancy={false} style={[commonStyles.root, { width: 200, height: 50, backgroundColor: 'red' }]} />
          </View>
        </VibrancyView>
        {/* </VisualEffectView> */}
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
