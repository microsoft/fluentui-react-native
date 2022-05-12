import * as React from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import { Menu, MenuItem, MenuItemCheckbox, MenuTrigger, MenuPopover, MenuList } from '@fluentui-react-native/menu';
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
          <MenuList>
            <Text>Hello world!!!</Text>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuCheckmarks: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu hasCheckmarks>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A MenuItem" />
            <MenuItemCheckbox content="A MenuItem" />
          </MenuList>
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
        <MenuList>
          <Text>Hello world!!!</Text>
        </MenuList>
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
          <MenuList>
            <MenuItem content="A MenuItem" />
            <Submenu />
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuOpenOnHover: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu openOnHover>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A MenuItem" />
            <Submenu />
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuControlledOpen: React.FunctionComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <Stack style={[stackStyle, { flexDirection: 'row' }]}>
      <Button onClick={() => setOpen(!open)}>Toggle open</Button>
      <Menu open={open}>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A MenuItem" />
            <Submenu />
          </MenuList>
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
    name: 'Menu Checkmarks',
    component: MenuCheckmarks,
  },
  {
    name: 'Menu open on hover',
    component: MenuOpenOnHover,
  },
  {
    name: 'Menu open controlled',
    component: MenuControlledOpen,
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
