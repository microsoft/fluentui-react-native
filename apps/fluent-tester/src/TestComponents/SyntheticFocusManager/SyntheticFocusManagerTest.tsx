import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import { Divider } from '@fluentui-react-native/divider';
import { SyntheticFocusManager } from '@fluentui-react-native/synthetic-focus-manager';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { Test } from '../Test';

const items = ['a', 'b', 'c', 'd', 'e'];
const itemLabels = {
  a: 'Item A',
  b: 'Item B Item B Item B',
  c: 'Item C Item C',
  d: 'Item D',
  e: 'Item E Item E Item E Item E',
};

const styles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 4,
  },
  textInputContainer: {
    padding: 4,
    marginVertical: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'gray',
  },
  textInput: {
    fontSize: 12,
  },
});

const tablistNativeID = 'SFM_TABLIST';

function TabListSyntheticFocusTest() {
  const [key, setKey] = React.useState('a');
  const focusManager = React.useRef(new SyntheticFocusManager()).current;

  const textInputProps = React.useMemo<IViewProps>(
    () => ({
      onBlur: () => {
        if (focusManager.active) {
          focusManager.disable();
        }
      },
      onKeyDown: (e) => {
        const { key, altKey } = e.nativeEvent;
        switch (key) {
          case 'ArrowDown':
            if (altKey) {
              focusManager.enable();
            }
            break;
          case 'ArrowUp':
            if (altKey) {
              focusManager.disable();
            }
            break;
          case 'ArrowLeft':
            if (focusManager.active) {
              focusManager.prev();
            }
            break;
          case 'ArrowRight':
            if (focusManager.active) {
              focusManager.next();
            }
            break;
          case 'Enter':
          case 'Space':
            setKey(focusManager.current?.key);
        }
      },
      keyDownEvents: [
        { key: 'ArrowDown', altKey: true },
        { key: 'ArrowUp', altKey: true },
        { key: 'ArrowRight' },
        { key: 'ArrowLeft' },
        { key: 'Enter' },
        { key: 'Space' },
      ],
      accessibilityControls: tablistNativeID,
    }),
    [focusManager],
  );
  return (
    <View style={styles.containerStyle}>
      <Text>
        With focus in the TextInput, press Alt-DOWN / Alt-UP to enable / disable tablist keyboard navigation while typing. Use LEFT / RIGHT
        to navigate between tabs.
      </Text>
      <View style={styles.textInputContainer}>
        <TextInput style={styles.textInput} {...textInputProps} />
      </View>
      <Divider />
      <TabList nativeID={tablistNativeID} syntheticFocusManager={focusManager} selectedKey={key} onTabSelect={setKey}>
        {items.map((item) => (
          <Tab key={item} tabKey={item}>
            {itemLabels[item]}
          </Tab>
        ))}
      </TabList>
    </View>
  );
}

export const SyntheticFocusManagerTest: React.FunctionComponent = () => {
  const description =
    'The `SyntheticFocusManager` is a class that allows a user to simulate focus on a set of FURN components. This is useful when the user needs to be able to keyboard navigate to parts of a UI while maintaining native focus on one element.';

  return (
    <Test
      name="SyntheticFocusManager Test"
      description={description}
      sections={[
        {
          name: 'TabList Synthetic Focus',
          component: TabListSyntheticFocusTest,
        },
      ]}
      status={{
        win32Status: 'Experimental',
        uwpStatus: 'Backlog',
        iosStatus: 'Backlog',
        macosStatus: 'Experimental',
        androidStatus: 'Backlog',
      }}
    />
  );
};
