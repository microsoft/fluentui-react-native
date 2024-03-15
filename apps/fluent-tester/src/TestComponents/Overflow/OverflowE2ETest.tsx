import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
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
      <Button onLayout={onMenuTriggerLayout} style={styles.menu}>
        <Text>{`${overflowCount} hidden`}</Text>
      </Button>
    );
  } else {
    return null;
  }
}

const items = ['a', 'b', 'c'];

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
      <Text>{ready ? 'Ready' : 'Not Ready'}</Text>
      <Text>{updated ? 'Updated' : 'Not Updated'}</Text>
      <Divider />
      <RadioGroup defaultValue="375" label="Width Options" onChange={handleRadioGroupChange}>
        <Radio label="175" value="175" />
        <Radio label="275" value="275" />
        <Radio label="375" value="375" />
      </RadioGroup>
      <Divider />
      <Overflow onOverflowUpdate={handleOverflowUpdate} itemIDs={items} style={overflowStyles} onReady={handleReady}>
        {items.map((id, i) => (
          <OverflowItem priority={items.length - i} overflowID={id} key={id}>
            <Button style={styles.item}>{`Item '${id}'`}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu />
      </Overflow>
    </View>
  );
}
