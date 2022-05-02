import * as React from 'react';
import { View } from 'react-native';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuTrigger, MenuPopover } from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/experimental-text';
import { stackStyle } from '../Common/styles';
import { MENU_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const MenuDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <View style={{ backgroundColor: 'red', height: 50, width: 200 }}>
            <Text>Hello world!!!</Text>
          </View>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const Submenu: React.FunctionComponent = () => {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem content="A second MenuItem" />
      </MenuTrigger>
      <MenuPopover>
        <View style={{ backgroundColor: 'blue', height: 50, width: 200 }}>
          <Text>Hello world!!!</Text>
        </View>
      </MenuPopover>
    </Menu>
  );
};

const MenuSubMenu: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <View style={{ backgroundColor: 'red', width: 200, alignItems: 'center' }}>
            <MenuItem content="A MenuItem" />
            <Submenu />
          </View>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const menuSections: TestSection[] = [
  {
    name: 'Menu Default',
    testID: MENU_TESTPAGE,
    component: MenuDefault,
  },
  {
    name: 'Menu Submenu',
    component: MenuSubMenu,
  },
];

export const MenuTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = '!!!!!!!TODO TODO TODO TODO!!!!!!!!';

  return <Test name="Menu Test" description={description} sections={menuSections} status={status}></Test>;
};
