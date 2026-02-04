import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui/react-native';
import { MENU_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import type { MenuProps } from '@fluentui-react-native/menu';
import {
  Menu,
  MenuItem,
  MenuItemCheckbox,
  MenuItemRadio,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuDivider,
  MenuGroup,
  MenuGroupHeader,
} from '@fluentui-react-native/menu';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { E2EMenuTest } from './E2EMenuTest';
import { MenuComponentOutsideMenuList } from './MenuComponentOutsideMenuList';
import { MenuIcons } from './MenuIcons';
import { MenuTriggerChildRef } from './MenuRefs';
import { MenuScrollView } from './MenuScrollView';
import { MenuTooltips } from './MenuTooltips';
import { MenuTriggerHoverCallback, MenuTriggerOnClickCallback } from './MenuTriggerCallbacks';
import { stackStyle } from '../Common/styles';
import { Test } from '../Test';
import type { TestSection, PlatformStatus } from '../Test';

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
            <MenuItem disabled>A disabled MenuItem</MenuItem>
            <MenuItem>A third plain MenuItem</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const defaultCheckedTestCase = ['itemOne'];
const checkedTestCase = ['itemTwo'];

const MenuCheckmarks: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu defaultChecked={defaultCheckedTestCase}>
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
      <Menu hasCheckmarks checked={checkedTestCase}>
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
            <MenuItemCheckbox name="itemTwo">A MenuItem with checkmark without alignment</MenuItemCheckbox>
            <MenuItemCheckbox name="itemThree">A MenuItem with checkmark without alignment</MenuItemCheckbox>
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
      <Menu defaultChecked={defaultCheckedTestCase} onCheckedChange={onCheckedChange}>
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

const Submenu: React.FunctionComponent<MenuProps> = (props: MenuProps) => {
  return (
    <Menu {...props}>
      <MenuTrigger>
        <MenuItem>A second MenuItem trigger</MenuItem>
      </MenuTrigger>
      <MenuPopover minWidth={230}>
        <MenuList>
          <MenuItemCheckbox name={'a'}>A nested MenuItemCheckbox</MenuItemCheckbox>
          <MenuItem>A nested MenuItem</MenuItem>
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

const SubmenuWithScrollView: React.FunctionComponent<MenuProps> = (props: MenuProps) => {
  return (
    <Menu {...props}>
      <MenuTrigger>
        <MenuItem>A second MenuItem trigger</MenuItem>
      </MenuTrigger>
      <MenuPopover maxHeight={200}>
        <MenuList>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
          <MenuItem>A nested MenuItem</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

const MenuSubMenuWithScrollView: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover doNotTakePointerCapture={true}>
          <MenuList>
            <MenuItem>A MenuItem</MenuItem>
            <SubmenuWithScrollView />
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

const rootStackStyle = StyleSheet.create({ root: { ...(stackStyle as object), flexDirection: 'row' } });

const MenuControlledOpen: React.FunctionComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);

  const onOpenChange = () => {
    setOpen(false);
  };

  return (
    <Stack style={rootStackStyle.root}>
      <Button onClick={() => setOpen(!open)}>Toggle open</Button>
      {/* For Android Platform the Controlled trigger becomes unavailable because of the screen we show on the screen click on which closes the Menu , Hence we need to make the state change based on open change */}

      <Menu {...(Platform.OS === 'android' && { onOpenChange })} open={open}>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A MenuItem</MenuItem>
            {Platform.OS !== 'android' && <Submenu />}
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
        <CustomMenuPopover directionalHint="rightCenter">
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

const MenuNofM: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItem disabled>A disabled MenuItem</MenuItem>
            <MenuItem accessibilityPosInSet={9}>A plain MenuItem</MenuItem>
            <MenuDivider />
            {Platform.OS !== 'android' && <Submenu accessibilityPosInSet={16} accessibilitySetSize={7} />}
            <MenuItem disabled accessibilitySetSize={2}>
              A disabled MenuItem
            </MenuItem>
            <MenuItem>A plain MenuItem</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const CustomMenuTrigger: React.FunctionComponent = () => {
  return (
    <View style={{ backgroundColor: 'purple', width: 80, flexDirection: 'row', justifyContent: 'center' }}>
      <MenuTrigger>
        <Button>Test</Button>
      </MenuTrigger>
    </View>
  );
};

const MenuWithCustomMenuTrigger: React.FunctionComponent<MenuProps> = (props: MenuProps) => {
  return (
    <Stack style={stackStyle}>
      <Menu {...props}>
        <CustomMenuTrigger />
        <MenuPopover>
          <MenuList>
            <MenuItem>A plain MenuItem</MenuItem>
            <MenuItem disabled>A disabled MenuItem</MenuItem>
            <MenuItem accessibilityPosInSet={9}>A plain MenuItem</MenuItem>
            <MenuDivider />
            {Platform.OS !== 'android' && <Submenu />}
            <MenuItem disabled accessibilitySetSize={2}>
              A disabled MenuItem
            </MenuItem>
            <MenuItem>A plain MenuItem</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const MenuWithGroups: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Menu>
        <MenuTrigger>
          <Button>Test</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuGroup>
              <MenuGroupHeader>Section 1</MenuGroupHeader>
              <MenuItem>A plain MenuItem</MenuItem>
              <MenuItem>A plain MenuItem</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuGroupHeader>Section 2</MenuGroupHeader>
              <MenuItem>A plain MenuItem</MenuItem>
              <MenuItem>A plain MenuItem</MenuItem>
              <MenuItem>A plain MenuItem</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup>
              <MenuItem>A plain MenuItem</MenuItem>
            </MenuGroup>
          </MenuList>
        </MenuPopover>
      </Menu>
    </Stack>
  );
};

const menuAsABlackboxStyles = StyleSheet.create({
  actionButton: { alignSelf: 'center', justifyContent: 'center' },
  switch: { marginHorizontal: 10 },
});

const MenuAsABlackbox: React.FunctionComponent = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [dnd, setDnD] = React.useState<boolean>(false);

  const onOpenChange = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onSwitchChange = React.useCallback(() => {
    setDnD(!dnd);
  }, [dnd, setDnD]);

  const onMenuTriggerClicked = React.useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <Stack style={stackStyle}>
      <Menu onOpenChange={onOpenChange} open={open}>
        <MenuTrigger>
          <Button onClick={onMenuTriggerClicked}>Blockbox Menu</Button>
        </MenuTrigger>

        <MenuPopover minWidth={200}>
          <MenuList>
            <Switch checked={dnd} onChange={onSwitchChange} style={menuAsABlackboxStyles.switch} label="Don't disturb" />
            <MenuItem>{dnd ? 'DND is on' : 'DND is off'}</MenuItem>
            <View style={menuAsABlackboxStyles.actionButton}>
              <Button appearance="subtle" onClick={onOpenChange}>
                Action
              </Button>
            </View>
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
  Platform.select({
    android: null,
    default: {
      name: 'Menu Submenu with ScrollView',
      component: MenuSubMenuWithScrollView,
    },
  }),
  Platform.select({
    android: null,
    default: {
      name: 'Menu open on hover',
      component: MenuOpenOnHover,
    },
  }),
  {
    name: 'Menu open controlled',
    component: MenuControlledOpen,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Menu with tooltips on items',
      component: MenuTooltips,
    },
  }),
  {
    name: 'Menu with icons',
    component: MenuIcons,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Menu Submenu',
      component: MenuSubMenu,
    },
  }),
  {
    name: 'Menu with ScrollView',
    component: MenuScrollView,
  },
  Platform.select({
    android: { name: 'Menu as a blackbox', component: MenuAsABlackbox },
    default: null,
  }),
  {
    name: 'Menu Trigger onClick Override',
    component: MenuTriggerOnClickCallback,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Menu Trigger Hover Override',
      component: MenuTriggerHoverCallback,
    },
  }),
  {
    name: 'Menu Customized',
    component: MenuCustomized,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Menu Refs',
      component: MenuTriggerChildRef,
    },
  }),
  {
    name: 'Menu N of M Override',
    component: MenuNofM,
  },
  {
    name: 'Menu with custom MenuTrigger',
    component: MenuWithCustomMenuTrigger,
  },
  {
    name: 'Menu with groups',
    component: MenuWithGroups,
  },
  Platform.select({
    android: null,
    default: {
      name: 'MenuList component outside menu list test',
      component: MenuComponentOutsideMenuList,
    },
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'Menu E2E',
    component: E2EMenuTest,
  },
];

export const MenuTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Production',
    androidStatus: 'Experimental',
  };

  const description =
    'A Menu is an component that displays a list of options on a temporary surface. They are invoked when users interact with a button, action, or other control.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Menu/SPEC.md';

  return <Test name="Menu Test" description={description} spec={spec} sections={menuSections} status={status} e2eSections={e2eSections} />;
};
