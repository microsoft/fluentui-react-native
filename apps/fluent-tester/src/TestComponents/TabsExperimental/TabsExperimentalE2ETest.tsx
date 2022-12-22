import * as React from 'react';
import { View } from 'react-native';
import { TextV1 as Text } from '@fluentui-react-native/text';
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
import { testProps } from '../Common/TestProps';

export const E2ETestExperimentalTabs: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs
          label="Tabs"
          accessibilityLabel={EXPERIMENTAL_TABS_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(EXPERIMENTAL_TABS_TEST_COMPONENT)}
        >
          <TabsItem
            headerText="Home"
            itemKey="A"
            accessibilityLabel={EXPERIMENTAL_TABS_ITEM_ACCESSIBILITY_LABEL}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT)}
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
        <Tabs
          label={EXPERIMENTAL_TABS_TEST_COMPONENT_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(EXPERIMENTAL_TABS_NO_A11Y_LABEL_COMPONENT)}
        >
          <TabsItem
            headerText={EXPERIMENTAL_TABS_ITEM_TEST_COMPONENT_LABEL}
            itemKey="A"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(EXPERIMENTAL_TABS_ITEM_NO_A11Y_LABEL_COMPONENT)}
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
