import * as React from 'react';
import { View } from 'react-native';

import { Tabs, TabsItem } from '@fluentui-react-native/experimental-tabs';
import { TextV1 as Text } from '@fluentui-react-native/text';

import {
  TABSV1_TEST_COMPONENT,
  TABSV1_ACCESSIBILITY_LABEL,
  TABSV1_NO_A11Y_LABEL_COMPONENT,
  TABSV1_TEST_COMPONENT_LABEL,
  TABSITEMV1_ITEM_1,
  TABSITEMV1_ITEM_2,
  TABSITEMV1_ITEM_3,
  TABSITEMV1_CONTENT_1,
  TABSITEMV1_CONTENT_2,
  TABSITEMV1_CONTENT_3,
  TABSITEMV1_ITEM_1_ACCESSIBILITY_LABEL,
  TABSITEMV1_NO_A11Y_LABEL_COMPONENT,
  TABSITEMV1_TEST_COMPONENT_LABEL,
} from '../../../../E2E/src/TabsV1/consts';
import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const TabsV1E2ETest: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs
          label="Tabs"
          accessibilityLabel={TABSV1_ACCESSIBILITY_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TABSV1_TEST_COMPONENT)}
        >
          <TabsItem
            headerText="Home"
            itemKey="A"
            accessibilityLabel={TABSITEMV1_ITEM_1_ACCESSIBILITY_LABEL}
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(TABSITEMV1_ITEM_1)}
          >
            <Text {...testProps(TABSITEMV1_CONTENT_1)}>Tabs #1</Text>
          </TabsItem>
          <TabsItem headerText="Files" itemKey="B" {...testProps(TABSITEMV1_ITEM_2)}>
            <Text {...testProps(TABSITEMV1_CONTENT_2)}>Tabs #2</Text>
          </TabsItem>
          <TabsItem headerText="Settings" itemKey="C" {...testProps(TABSITEMV1_ITEM_3)}>
            <Text {...testProps(TABSITEMV1_CONTENT_3)}>Tabs #3</Text>
          </TabsItem>
        </Tabs>
      </View>
      <View style={stackStyle}>
        <Tabs
          label={TABSV1_TEST_COMPONENT_LABEL}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(TABSV1_NO_A11Y_LABEL_COMPONENT)}
        >
          <TabsItem
            headerText={TABSITEMV1_TEST_COMPONENT_LABEL}
            itemKey="A"
            /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
            {...testProps(TABSITEMV1_NO_A11Y_LABEL_COMPONENT)}
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
