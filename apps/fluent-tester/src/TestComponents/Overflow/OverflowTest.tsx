import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import { Menu, MenuTrigger, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import { Overflow, OverflowItem, OverflowTab, OverflowTabList, useOverflowMenu } from '@fluentui-react-native/overflow';
import { TextV1 as Text } from '@fluentui-react-native/text';

import MoreHorizontalIcon from './MoreHorizontalFilled.svg';
import { Test } from '../Test';

const items = ['a', 'b', 'c', 'd', 'e'];
const itemLabels = {
  a: 'Item A',
  b: 'Item B Item B Item B',
  c: 'Item C Item C',
  d: 'Item D',
  e: 'Item E Item E Item E Item E',
};
const itemPriorities = {
  a: 1,
  b: 1,
  c: 1,
  d: 1,
  e: 1,
};

const containerStyle: ViewStyle = {
  paddingVertical: 4,
};

interface OverflowMenuProps {
  onItemClick: (id: string) => void;
}

function OverflowMenu(props: OverflowMenuProps) {
  const { showMenu, menuItems, menuRef, onLayout } = useOverflowMenu();
  if (showMenu) {
    return (
      <Menu>
        <MenuTrigger>
          <Button
            onLayout={onLayout}
            style={{ alignSelf: 'center' }}
            appearance="subtle"
            iconOnly
            icon={{ svgSource: { src: MoreHorizontalIcon, viewBox: '0 0 20 20' } }}
            componentRef={menuRef}
          />
        </MenuTrigger>
        <MenuPopover>
          {menuItems.map((id) => (
            <MenuItem onClick={() => props.onItemClick(id)} key={id}>
              {itemLabels[id]}
            </MenuItem>
          ))}
        </MenuPopover>
      </Menu>
    );
  } else {
    return null;
  }
}

export function OverflowMainTest() {
  const [key, setKey] = React.useState('e');
  return (
    <View>
      <Text>Hi</Text>
      {/* <OverflowTabList
        onOverflowUpdate={(data) => {
          if (data.invisibleIds.contains(key)) {
            setKey(undefined);
          }
        }}
        selectedKey={key}
        onTabSelect={setKey}
        tabKeys={items}
      >
        {items.map((item) => (
          <OverflowTab priority={itemPriorities[item] + (key === item ? 5 : 0)} tabKey={item} key={item}>
            {itemLabels[item]}
          </OverflowTab>
        ))}
        <OverflowMenu onItemClick={setKey} />
      </OverflowTabList> */}
      <Overflow itemIDs={items}>
        {items.map((item) => (
          <OverflowItem key={item} overflowID={item}>
            <Button>{itemLabels[item]}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu onItemClick={(item) => console.log(item)} />
      </Overflow>
    </View>
  );
}

export function OverflowDifferentWidthTest() {
  return (
    <View>
      <Text variant="heroLargeStandard">Hidden Before Layout</Text>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 250</Text>
        <Overflow style={{ width: 250 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 75</Text>
        <Overflow style={{ width: 75 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
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
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
      <View style={containerStyle}>
        <Text variant="headerSemibold">Width: 150</Text>
        <Overflow dontHideBeforeReady style={{ width: 150 }} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
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
            <OverflowItem overflowID={item} key={item}>
              Item {' ' + item}
            </OverflowItem>
          ))}
        </Overflow>
      </View>
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
