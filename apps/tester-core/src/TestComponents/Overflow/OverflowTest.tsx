import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import { OVERFLOW_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Menu, MenuTrigger, MenuList, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import { Overflow, OverflowItem, useOverflowMenu } from '@fluentui-react-native/overflow';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { E2EOverflowTest } from './OverflowE2ETest';
import MoreHorizontalIcon from '../../../assets/MoreHorizontalFilled.svg';
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
  dynamicAddRemoval: {
    width: 400,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
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
                {itemLabels[id] ?? 'Item ' + id}
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

function OverflowDynamicAddRemovalTest() {
  const [ids, setIDs] = React.useState(['1', '2', '3']);
  const addItem = React.useCallback(
    () =>
      setIDs((prev) => {
        const newItem = (parseInt(prev[prev.length - 1]) + 1).toString();
        return [...prev, newItem];
      }),
    [],
  );
  const removeItem = React.useCallback((item: string) => setIDs((prev) => prev.filter((x) => x !== item)), []);
  return (
    <View style={overflowTestPageStyles.containerStyle}>
      <Text>Add buttons using the button below. Remove by clicking on individual items in the Overflow container.</Text>
      <Button onClick={addItem}>Add item</Button>
      <Text>Overflow Items (raw): {ids.reduce((prev, curr) => prev + ', ' + curr)}</Text>
      <Divider />
      <Overflow padding={4} style={overflowTestPageStyles.dynamicAddRemoval} itemIDs={ids}>
        {ids.map((id) => {
          return (
            <OverflowItem key={id} overflowID={id}>
              <Button onClick={() => removeItem(id)}>{'Item ' + id}</Button>
            </OverflowItem>
          );
        })}
        <OverflowMenu onItemPress={removeItem} />
      </Overflow>
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
          testID: OVERFLOW_TESTPAGE,
        },
        {
          name: 'Overflow TabList',
          component: OverflowTabTest,
        },
        {
          name: 'Overflow Dynamic Add/Removal of Items',
          component: OverflowDynamicAddRemovalTest,
        },
        {
          name: 'Overflow Variable Width',
          component: OverflowDifferentWidthTest,
        },
      ]}
      e2eSections={[
        {
          name: 'Overflow E2E Section',
          component: E2EOverflowTest,
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
