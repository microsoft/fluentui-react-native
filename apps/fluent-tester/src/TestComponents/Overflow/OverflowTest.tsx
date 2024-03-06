import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import { Menu, MenuTrigger, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import { Overflow, OverflowItem, useOverflowMenu } from '@fluentui-react-native/overflow';
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

const overflowTestPageStyles = StyleSheet.create({
  containerStyle: {
    paddingVertical: 4,
  },
  width100: {
    width: 100,
  },
  width250: {
    width: 250,
  },
  width400: {
    width: 400,
  },
});

interface OverflowMenuProps {
  onItemPress: (id: string) => void;
}

function OverflowMenu(props: OverflowMenuProps) {
  const { showMenu, menuItemVisibilities, menuRef, onLayout } = useOverflowMenu();
  if (showMenu) {
    return (
      <Menu>
        <MenuTrigger>
          <Button
            accessibilityLabel="More options"
            onLayout={onLayout}
            style={{ alignSelf: 'center' }}
            appearance="subtle"
            iconOnly
            icon={{ svgSource: { src: MoreHorizontalIcon, viewBox: '0 0 20 20' } }}
            componentRef={menuRef}
          />
        </MenuTrigger>
        <MenuPopover>
          {items
            .filter((id) => menuItemVisibilities[id])
            .map((id) => (
              <MenuItem onClick={() => props.onItemPress(id)} key={id}>
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
  return (
    <View style={overflowTestPageStyles.containerStyle}>
      <Overflow itemIDs={items}>
        {items.map((item) => (
          <OverflowItem key={item} overflowID={item}>
            <Button>{itemLabels[item]}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu onItemPress={console.log} />
      </Overflow>
    </View>
  );
}

export function OverflowDifferentWidthTest() {
  return (
    <View>
      <Text variant="heroStandard">Hidden Before Layout</Text>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong">Width: 400</Text>
        <Overflow style={overflowTestPageStyles.width400} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong">Width: 250</Text>
        <Overflow style={overflowTestPageStyles.width250} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong">Width: 100</Text>
        <Overflow style={overflowTestPageStyles.width100} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
      <Divider />
      <Text variant="heroStandard">Visible Before Layout</Text>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong">Width: 400</Text>
        <Overflow dontHideBeforeReady style={overflowTestPageStyles.width400} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong">Width: 250</Text>
        <Overflow dontHideBeforeReady style={overflowTestPageStyles.width250} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
      <View style={overflowTestPageStyles.containerStyle}>
        <Text variant="body1Strong" style={overflowTestPageStyles.containerStyle}>
          Width: 100
        </Text>
        <Overflow dontHideBeforeReady style={overflowTestPageStyles.width100} itemIDs={items}>
          {items.map((item) => (
            <OverflowItem overflowID={item} key={item}>
              <Button>Item {' ' + item}</Button>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={console.log} />
        </Overflow>
      </View>
    </View>
  );
}

export const OverflowTest: React.FunctionComponent = () => {
  const description = 'Experimental component based off web v9 Overflow.';

  return (
    <Test
      name="Overflow Test"
      description={description}
      sections={[
        {
          name: 'Overflow',
          component: OverflowMainTest,
        },
        {
          name: 'Overflow Variable Width',
          component: OverflowDifferentWidthTest,
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
