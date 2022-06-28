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
import { E2EMenuTest } from './E2EMenuTest';

const MenuDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItem disabled>A second disabled plain MenuItem</MenuItem>
            <MenuItem>A third plain MenuItem</MenuItem>
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
            <MenuItemCheckbox name="itemOne">A MenuItem with checkmark</MenuItemCheckbox>
            <MenuDivider />
            <MenuItemCheckbox name="itemTwo">Another MenuItem with checkmark</MenuItemCheckbox>
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu hasCheckmarks checked={['itemTwo']}>
        <MenuTrigger>
          <Button>Some controlled checkmark items with alignment</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItemCheckbox name="itemTwo">A MenuItem with checkmark</MenuItemCheckbox>
            <MenuItemCheckbox disabled name="itemThree">
              A disabled MenuItem with checkmark
            </MenuItemCheckbox>
            <MenuItemCheckbox name="itemFour">A MenuItem with checkmark</MenuItemCheckbox>
          </MenuList>
        </MenuPopover>
      </Menu>
      <Menu>
        <MenuTrigger>
          <Button>Some checkmark items without alignment</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItemCheckbox name="itemTwo">A MenuItem with checkmark</MenuItemCheckbox>
            <MenuItemCheckbox name="itemThree">A MenuItem with checkmark</MenuItemCheckbox>
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
            <MenuItemRadio name="itemOne">A MenuItem with checkmark and radio selection</MenuItemRadio>
            <MenuItemRadio name="itemTwo">Another MenuItem with checkmark and radio selection</MenuItemRadio>
            <MenuItemRadio name="itemThree">A third MenuItem with checkmark and radio selection</MenuItemRadio>
            <MenuItemCheckbox name="itemFour">A MenuItem with checkmark and toggle selection</MenuItemCheckbox>
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
        <MenuItem>A second MenuItem</MenuItem>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A second nested MenuItem</MenuItem>
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
            <MenuItem>A MenuItem</MenuItem>
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
            <MenuItem>A MenuItem</MenuItem>
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
            <MenuItem>A MenuItem</MenuItem>
            <Submenu />
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const CustomMenuPopover = MenuPopover.customize({ borderWidth: 4, borderColor: 'blue' });
const CustomMenuList = MenuList.customize({ gap: 5, padding: 6, backgroundColor: 'pink' });
const CustomMenuItem = MenuItem.customize({
  gap: 5,
  padding: 8,
  backgroundColor: 'red',
  color: 'white',
  borderRadius: 2,
  checkmarkSize: 10,
  submenuIndicatorPadding: 4,
  submenuIndicatorSize: 10,
  fontSize: 14,
});
const CustomMenuCheckmark = MenuItemCheckbox.customize({
  gap: 5,
  padding: 8,
  backgroundColor: 'red',
  color: 'white',
  borderRadius: 2,
  checkmarkSize: 10,
  fontSize: 14,
  checkmarkColor: 'blue',
});
const CustomMenuDivider = MenuDivider.customize({
  height: 8,
  margin: 4,
  marginVertical: 6,
  width: 100,
  backgroundColor: 'purple',
});

const MenuCustomized: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <CustomMenuPopover>
          <CustomMenuList>
            <CustomMenuItem>A MenuItem</CustomMenuItem>
            <CustomMenuItem>A MenuItem</CustomMenuItem>
            <CustomMenuDivider />
            <CustomMenuCheckmark name={'custom'}>A MenuItem</CustomMenuCheckmark>
          </CustomMenuList>
        </CustomMenuPopover>
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
  {
    name: 'Menu Customized',
    component: MenuCustomized,
  },
  {
    name: 'Menu E2E',
    component: E2EMenuTest,
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

  const description =
    'A Menu is an component that displays a list of options on a temporary surface. They are invoked when users interact with a button, action, or other control.';

  return <Test name="Menu Test" description={description} sections={menuSections} status={status}></Test>;
};
