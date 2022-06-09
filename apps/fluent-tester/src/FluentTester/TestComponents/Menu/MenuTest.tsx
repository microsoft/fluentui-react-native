import * as React from 'react';
import { ButtonV1 as Button } from '@fluentui/react-native';
import {
  Menu,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuDivider,
} from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { MENU_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Text } from '@fluentui-react-native/experimental-text';

const MenuDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A plain MenuItem" />
            <MenuItem disabled content="A second disabled plain MenuItem" />
            <MenuItem content="A third plain MenuItem" />
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuCheckmarks: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu defaultChecked={['itemOne']}>
        <MenuTrigger>
          <Button>All checkmark items</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemCheckbox name="itemOne" content="A MenuItem with checkmark" />
            <MenuDivider />
            <MenuItemCheckbox name="itemTwo" content="Another MenuItem with checkmark" />
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu hasCheckmarks checked={['itemTwo']}>
        <MenuTrigger>
          <Button>Some controlled checkmark items with alignment</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A plain MenuItem" />
            <MenuItemCheckbox name="itemTwo" content="A MenuItem with checkmark" />
            <MenuItemCheckbox disabled name="itemThree" content="A disabled MenuItem with checkmark" />
            <MenuItemCheckbox name="itemFour" content="A MenuItem with checkmark" />
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu>
        <MenuTrigger>
          <Button>Some checkmark items without alignment</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem content="A plain MenuItem" />
            <MenuItemCheckbox name="itemTwo" content="A MenuItem with checkmark" />
            <MenuItemCheckbox name="itemThree" content="A MenuItem with checkmark" />
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuRadioItem: React.FunctionComponent = () => {
  const [checked, setChecked] = React.useState(['itemOne']);
  const onCheckedChange = React.useCallback(
    (_e, checkedChange) => {
      setChecked(checkedChange);
    },
    [setChecked],
  );

  return (
    <Stack style={stackStyle}>
      <Text>Current checked: {checked.join(' ')}</Text>
      <Menu defaultChecked={['itemOne']} onCheckedChange={onCheckedChange}>
        <MenuTrigger>
          <Button>Items with radio selection</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemRadio name="itemOne" content="A MenuItem with checkmark and radio selection" />
            <MenuItemRadio name="itemTwo" content="Another MenuItem with checkmark and radio selection" />
            <MenuItemRadio name="itemThree" content="A third MenuItem with checkmark and radio selection" />
            <MenuItemCheckbox name="itemFour" content="A MenuItem with checkmark and toggle selection" />
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
          <MenuItem content="A nested MenuItem" />
          <MenuItem content="A second nested MenuItem" />
          <Submenu />
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
    name: 'Menu Radioitem',
    component: MenuRadioItem,
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
