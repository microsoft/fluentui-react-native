import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabsItem, Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import {
  TABS_TEST_COMPONENT,
  TABS_ACCESSIBILITY_LABEL,
  TABS_ITEM_TEST_COMPONENT,
  TABS_ITEM_ACCESSIBILITY_LABEL,
  TABS_ITEM_NO_A11Y_LABEL_COMPONENT,
  TABS_TEST_COMPONENT_LABEL,
  TABS_ITEM_TEST_COMPONENT_LABEL,
  TABS_NO_A11Y_LABEL_COMPONENT,
} from './consts';

export const E2ETabsTest: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs label="Tabs" testID={TABS_TEST_COMPONENT} accessibilityLabel={TABS_ACCESSIBILITY_LABEL}>
          <TabsItem headerText="Home" itemKey="A" testID={TABS_ITEM_TEST_COMPONENT} accessibilityLabel={TABS_ITEM_ACCESSIBILITY_LABEL}>
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
        <Tabs label={TABS_TEST_COMPONENT_LABEL} testID={TABS_NO_A11Y_LABEL_COMPONENT}>
          <TabsItem headerText={TABS_ITEM_TEST_COMPONENT_LABEL} itemKey="A" testID={TABS_ITEM_NO_A11Y_LABEL_COMPONENT}>
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
