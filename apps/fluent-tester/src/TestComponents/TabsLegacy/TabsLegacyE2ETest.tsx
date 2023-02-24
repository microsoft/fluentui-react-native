import * as React from 'react';
import { View } from 'react-native';

import { Tabs, TabsItem, Text } from '@fluentui/react-native';

import {
  TABS_TEST_COMPONENT,
  TABS_ACCESSIBILITY_LABEL,
  TABS_TEST_COMPONENT_LABEL,
  TABS_NO_A11Y_LABEL_COMPONENT,
  SECOND_TABS_ITEM_CONTENT,
  FIRST_TABS_ITEM,
  SECOND_TABS_ITEM,
  THIRD_TABS_ITEM,
  FIRST_TABS_ITEM_ACCESSIBILITY_LABEL,
  THIRD_TABS_ITEM_LABEL,
  THIRD_TABS_ITEM_CONTENT,
  FIRST_TABS_ITEM_CONTENT,
} from '../../../../E2E/src/TabsLegacy/consts';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const TabsLegacyE2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs
          label="Tabs"
          accessibilityLabel={TABS_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TABS_TEST_COMPONENT)}
        >
          <TabsItem
            headerText="Home"
            itemKey="A"
            accessibilityLabel={FIRST_TABS_ITEM_ACCESSIBILITY_LABEL}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(FIRST_TABS_ITEM)}
          >
            <Text
              /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
              {...testProps(FIRST_TABS_ITEM_CONTENT)}
            >
              Tabs #1
            </Text>
          </TabsItem>
          <TabsItem
            headerText="Files"
            itemKey="B"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(SECOND_TABS_ITEM)}
          >
            <Text
              /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
              {...testProps(SECOND_TABS_ITEM_CONTENT)}
            >
              Tabs #2
            </Text>
          </TabsItem>
          <TabsItem
            headerText={THIRD_TABS_ITEM_LABEL}
            itemKey="C"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(THIRD_TABS_ITEM)}
          >
            <Text
              /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
              {...testProps(THIRD_TABS_ITEM_CONTENT)}
            >
              Tabs #3
            </Text>
          </TabsItem>
        </Tabs>
      </View>
      <View style={stackStyle}>
        <Tabs
          label={TABS_TEST_COMPONENT_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TABS_NO_A11Y_LABEL_COMPONENT)}
        >
          <TabsItem headerText="Home" itemKey="A">
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
