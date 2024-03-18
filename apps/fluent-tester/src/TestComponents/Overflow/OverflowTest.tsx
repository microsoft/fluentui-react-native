import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import { Menu, MenuTrigger, MenuList, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import { Overflow, OverflowItem, useOverflowMenu } from '@fluentui-react-native/overflow';
import { TabList, Tab } from '@fluentui-react-native/tablist';
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
  menuTrigger: {
    alignSelf: 'center',
  },
});

interface OverflowMenuProps {
  onItemPress: (id: string) => void;
}

function OverflowMenu(props: OverflowMenuProps) {
  const { showMenu, visibleMenuItems, menuTriggerRef, onMenuTriggerLayout } = useOverflowMenu();
  if (showMenu) {
    return (
      <Menu>
        <MenuTrigger>
          <Button
            accessibilityLabel="More options"
            onLayout={onMenuTriggerLayout}
            style={overflowTestPageStyles.menuTrigger}
            appearance="subtle"
            iconOnly
            icon={{ svgSource: { src: MoreHorizontalIcon, viewBox: '0 0 20 20' } }}
            componentRef={menuTriggerRef}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {visibleMenuItems.map((id) => (
              <MenuItem onClick={() => props.onItemPress(id)} key={id}>
                {itemLabels[id]}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    );
  } else {
    return null;
  }
}

function OverflowMainTest() {
  return (
    <View style={overflowTestPageStyles.containerStyle}>
      <Overflow itemIDs={items}>
        {items.map((item) => (
          <OverflowItem key={item} overflowID={item}>
            <Button onClick={() => console.log(item)}>{itemLabels[item]}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu onItemPress={console.log} />
      </Overflow>
    </View>
  );
}

function OverflowTabTest() {
  const [key, setKey] = React.useState('a');
  return (
    <View style={overflowTestPageStyles.containerStyle}>
      <Overflow dontHideBeforeReady itemIDs={items}>
        <TabList selectedKey={key} onTabSelect={setKey}>
          {items.map((item) => (
            <OverflowItem priority={key === item ? 2 : 1} key={item} overflowID={item}>
              <Tab tabKey={item}>{itemLabels[item]}</Tab>
            </OverflowItem>
          ))}
          <OverflowMenu onItemPress={setKey} />
        </TabList>
      </Overflow>
    </View>
  );
}

function OverflowWidthExample(props: { width: number; dontHideBeforeReady?: boolean }) {
  const style = React.useMemo<ViewStyle>(() => ({ width: props.width }), [props]);
  return (
    <View style={overflowTestPageStyles.containerStyle}>
      <Text variant="body1Strong">{`Width: ${props.width}`}</Text>
      <Overflow dontHideBeforeReady={props.dontHideBeforeReady} style={style} itemIDs={items}>
        {items.map((item) => (
          <OverflowItem overflowID={item} key={item}>
            <Button>Item {' ' + item}</Button>
          </OverflowItem>
        ))}
        <OverflowMenu onItemPress={console.log} />
      </Overflow>
    </View>
  );
}

function OverflowDifferentWidthTest() {
  return (
    <View>
      <Text variant="heroStandard">Hidden Before Layout</Text>
      <OverflowWidthExample width={100} />
      <OverflowWidthExample width={250} />
      <OverflowWidthExample width={400} />
      <Divider />
      <Text variant="heroStandard">Visible Before Layout</Text>
      <OverflowWidthExample dontHideBeforeReady width={100} />
      <OverflowWidthExample dontHideBeforeReady width={250} />
      <OverflowWidthExample dontHideBeforeReady width={400} />
    </View>
  );
}

export const OverflowTest: React.FunctionComponent = () => {
  const description =
    'The `Overflow` and `OverflowItem` components, based off the same Fluent web v9 components of the same name, are low level utilities that enable users to create overflow experiences with any component. These components will detect and hide overflowing elements on screen and manage the overflow state.';

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
          name: 'Overflow TabList',
          component: OverflowTabTest,
        },
        {
          name: 'Overflow Variable Width',
          component: OverflowDifferentWidthTest,
        },
      ]}
      spec="https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/Overflow/SPEC.md"
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
