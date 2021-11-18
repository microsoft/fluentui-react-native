import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/experimental-text';
import { Tabs, TabsItem } from '@fluentui-react-native/experimental-tabs';
import { stackStyle } from '../Common/styles';
import {
  EXPERIMENTAL_TABS_TEST_COMPONENT,
  EXPERIMENTAL_TABS_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_TABS_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_TABS_TEST_COMPONENT_LABEL,
  EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT,
  EXPERIMENTAL_TABS_ITEM_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_TABS_ITEM_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT_LABEL,
} from './consts';

export const E2ETestExperimentalTabs: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs label="Tabs" testID={EXPERIMENTAL_TABS_TEST_COMPONENT} accessibilityLabel={EXPERIMENTAL_TABS_ACCESSIBILITY_LABEL}>
          <TabsItem
            headerText="Home"
            itemKey="A"
            testID={EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT}
            accessibilityLabel={EXPERIMENTAL_TABS_ITEM_ACCESSIBILITY_LABEL}
          >
            <Text>Tabs #1</Text>
          </TabsItem>
          <TabsItem headerText="Files" itemKey="B">
            <Text>Tabs #2</Text>
          </TabsItem>
          <TabsItem headerText="Settings" itemKey="C">
            <Text>Tabs #3</Text>
          </TabsItem>
        </Tabs>
      </View>
      <View style={stackStyle}>
        <Tabs label={EXPERIMENTAL_TABS_TEST_COMPONENT_LABEL} testID={EXPERIMENTAL_TABS_NO_A11Y_LABEL_COMPONENT}>
          <TabsItem
            headerText={EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT_LABEL}
            itemKey="A"
            testID={EXPERIMENTAL_TABS_ITEM_NO_A11Y_LABEL_COMPONENT}
          >
            <Text>Tabs #1</Text>
          </TabsItem>
          <TabsItem headerText="Files" itemKey="B">
            <Text>Tabs #2</Text>
          </TabsItem>
          <TabsItem headerText="Settings" itemKey="C">
            <Text>Tabs #3</Text>
          </TabsItem>
        </Tabs>
      </View>
    </View>
  );
};
