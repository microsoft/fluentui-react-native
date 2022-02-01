import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabsItem, Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
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
} from './consts';

export const E2ETabsTest: React.FunctionComponent = () => {
  return (
    <View>
      <View style={stackStyle}>
        <Tabs label="Tabs" testID={TABS_TEST_COMPONENT} accessibilityLabel={TABS_ACCESSIBILITY_LABEL}>
          <TabsItem headerText="Home" itemKey="A" testID={FIRST_TABS_ITEM} accessibilityLabel={FIRST_TABS_ITEM_ACCESSIBILITY_LABEL}>
            <Text testID={FIRST_TABS_ITEM_CONTENT}>Tabs #1</Text>
          </TabsItem>
          <TabsItem headerText="Files" itemKey="B" testID={SECOND_TABS_ITEM}>
            <Text testID={SECOND_TABS_ITEM_CONTENT}>Tabs #2</Text>
          </TabsItem>
          <TabsItem headerText={THIRD_TABS_ITEM_LABEL} itemKey="C" testID={THIRD_TABS_ITEM}>
            <Text testID={THIRD_TABS_ITEM_CONTENT}>Tabs #3</Text>
          </TabsItem>
        </Tabs>
      </View>
      <View style={stackStyle}>
        <Tabs label={TABS_TEST_COMPONENT_LABEL} testID={TABS_NO_A11Y_LABEL_COMPONENT}>
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
