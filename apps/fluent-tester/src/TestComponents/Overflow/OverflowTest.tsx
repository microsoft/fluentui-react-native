import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import { Overflow, OverflowItem } from '@fluentui-react-native/overflow';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { Test } from '../Test';

const containerStyle: ViewStyle = {
  paddingVertical: 4,
};

export function OverflowMainTest() {
  const items = ['a', 'b', 'c'];
  return (
    <View>
      {/* <Text variant="heroLargeStandard">Hidden Before Layout</Text>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 250</Text>
        <Overflow style={{ width: 250 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 75</Text>
        <Overflow style={{ width: 75 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <Divider />
      <Text variant="heroLargeStandard">Visible Before Layout</Text>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 250</Text>
        <Overflow dontHideBeforeReady style={{ width: 250 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow dontHideBeforeReady style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold" style={{ paddingVertical: 8 }}>
          Width: 75
        </Text>
        <Overflow dontHideBeforeReady style={{ width: 75 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem id={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View> */}
      <Overflow itemIDs={items}>
        {items.map((item) => (
          <OverflowItem id={item} key={item}>
            Item {' ' + item}
          </OverflowItem>
        ))}
      </Overflow>
    </View>
  );
}

export const OverflowTest: React.FunctionComponent = () => {
  const description = 'A Divider is a visual separator that can contain content (text or an icon). Dividers can be horizontal or vertical';
  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Divider/SPEC.md';

  return (
    <Test
      name="Divider Test"
      description={description}
      sections={[
        {
          name: 'Overflow',
          component: OverflowMainTest,
        },
      ]}
      spec={spec}
      status={{
        win32Status: 'Production',
        uwpStatus: 'Backlog',
        iosStatus: 'Production',
        macosStatus: 'Production',
        androidStatus: 'Production',
      }}
    />
  );
};
