import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import {
  FIRST_OVERFLOW_ITEM,
  FIRST_OVERFLOW_ITEM_ID,
  SECOND_OVERFLOW_ITEM,
  SECOND_OVERFLOW_ITEM_ID,
  THIRD_OVERFLOW_ITEM,
  THIRD_OVERFLOW_ITEM_ID,
  OVERFLOW_MENU,
  READY_LABEL,
  READY_VALUE_FALSE,
  READY_VALUE_TRUE,
  UPDATED_LABEL,
  UPDATED_VALUE_FALSE,
  UPDATED_VALUE_TRUE,
  RADIO_175,
  RADIO_275,
  RADIO_375,
} from '@fluentui-react-native/e2e-testing';
import { Overflow, OverflowItem, useOverflowMenu } from '@fluentui-react-native/overflow';
import { RadioGroupV1 as RadioGroup, Radio } from '@fluentui-react-native/radio-group';
import { TextV1 as Text } from '@fluentui-react-native/text';

const styles = StyleSheet.create({
  menu: {
    width: 50,
  },
  item: {
    width: 100,
  },
});

function OverflowMenu() {
  const { showMenu, visibleMenuItems, onMenuTriggerLayout } = useOverflowMenu();
  const overflowCount = visibleMenuItems.length;

  if (showMenu) {
    return (
      <Button testID={OVERFLOW_MENU} onLayout={onMenuTriggerLayout} style={styles.menu}>
        {`${overflowCount} hidden`}
      </Button>
    );
  } else {
    return null;
  }
}

const items = [FIRST_OVERFLOW_ITEM_ID, SECOND_OVERFLOW_ITEM_ID, THIRD_OVERFLOW_ITEM_ID];
const itemsToTestIDs = {
  [FIRST_OVERFLOW_ITEM_ID]: FIRST_OVERFLOW_ITEM,
  [SECOND_OVERFLOW_ITEM_ID]: SECOND_OVERFLOW_ITEM,
  [THIRD_OVERFLOW_ITEM_ID]: THIRD_OVERFLOW_ITEM,
};

export function E2EOverflowTest() {
  const [overflowStyles, setOverflowStyles] = React.useState<StyleProp<ViewStyle>>({});
  const [ready, setReady] = React.useState(false);
  const [updated, setUpdated] = React.useState(false);

  const handleRadioGroupChange = React.useCallback((key) => {
    setUpdated(false);
    const keyAsInt = parseInt(key);
    setOverflowStyles({ width: keyAsInt });
  }, []);

  const handleReady = React.useCallback(() => setReady(true), []);
  const handleOverflowUpdate = React.useCallback(() => setUpdated(true), []);

  return (
    <View>
      <Text testID={READY_LABEL}>{ready ? READY_VALUE_TRUE : READY_VALUE_FALSE}</Text>
      <Text testID={UPDATED_LABEL}>{updated ? UPDATED_VALUE_TRUE : UPDATED_VALUE_FALSE}</Text>
      <Divider />
      <RadioGroup defaultValue="375" label="Width Options" onChange={handleRadioGroupChange}>
        <Radio testID={RADIO_175} label="175" value="175" />
        <Radio testID={RADIO_275} label="275" value="275" />
        <Radio testID={RADIO_375} label="375" value="375" />
      </RadioGroup>
      <Divider />
      <Overflow onOverflowUpdate={handleOverflowUpdate} itemIDs={items} style={overflowStyles} onReady={handleReady}>
        {items.map((id, i) => (
          <OverflowItem testID={itemsToTestIDs[id]} priority={items.length - i} overflowID={id} key={id}>
            <Button style={styles.item}>{`Item '${id}'`}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu />
      </Overflow>
    </View>
  );
}
