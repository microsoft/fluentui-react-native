import * as React from 'react';
import { View } from 'react-native';

import {
  TABLIST_TEST_COMPONENT,
  TABLIST_ACCESSIBILITY_LABEL,
  FIRST_TAB,
  FIRST_TAB_ACCESSIBILITY_LABEL,
  SECOND_TAB,
  THIRD_TAB,
  FOURTH_TAB,
  FIFTH_TAB,
  FIRST_TAB_KEY,
  TABLIST_CALLBACK_TEXT,
  FOURTH_TAB_KEY,
  SECOND_TAB_KEY,
  THIRD_TAB_KEY,
  SECOND_TAB_LABEL,
} from '@fluentui-react-native/e2e-testing';
import { Stack } from '@fluentui-react-native/stack';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';
import { testProps } from '../Common/TestProps';

export const TabListE2ETest: React.FunctionComponent = () => {
  const [key, setKey] = React.useState(FIRST_TAB_KEY);
  return (
    <View>
      <Stack style={stackStyle}>
        <TabList
          accessibilityLabel={TABLIST_ACCESSIBILITY_LABEL}
          onTabSelect={setKey}
          selectedKey={key}
          {...testProps(TABLIST_TEST_COMPONENT)}
        >
          <Tab tabKey={FIRST_TAB_KEY} accessibilityLabel={FIRST_TAB_ACCESSIBILITY_LABEL} {...testProps(FIRST_TAB)}>
            Option A
          </Tab>
          <Tab tabKey={SECOND_TAB_KEY} {...testProps(SECOND_TAB)}>
            {SECOND_TAB_LABEL}
          </Tab>
          <Tab disabled tabKey={THIRD_TAB_KEY} {...testProps(THIRD_TAB)}>
            Option C
          </Tab>
          <Tab tabKey={FOURTH_TAB_KEY} {...testProps(FOURTH_TAB)}>
            Option D
          </Tab>
        </TabList>
        <TabList>
          <Tab tabKey="1" {...testProps(FIFTH_TAB)}>
            Option 1
          </Tab>
          <Tab tabKey="2">Option 2</Tab>
          <Tab disabled tabKey="3">
            Option 3
          </Tab>
          <Tab tabKey="4">Option 4</Tab>
        </TabList>
        <Text {...testProps(TABLIST_CALLBACK_TEXT)}>{key}</Text>
      </Stack>
    </View>
  );
};
