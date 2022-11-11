import * as React from 'react';
import { AccessibilityActionName } from 'react-native';
import * as renderer from 'react-test-renderer';
import { Menu } from '../Menu/Menu';
import { checkReRender } from '@fluentui-react-native/test-tools';
import MenuTrigger from '../MenuTrigger/MenuTrigger';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import MenuPopover from '../MenuPopover/MenuPopover';
import { MenuList } from '../MenuList/MenuList';
import { MenuItem } from '../MenuItem/MenuItem';
import { MenuItemCheckbox } from '../MenuItemCheckbox/MenuItemCheckbox';
import { MenuDivider } from '../MenuDivider/MenuDivider';
import { MenuItemRadio } from '../MenuItemRadio/MenuItemRadio';

describe('Menu component tests', () => {
  it('Menu default', () => {
    const tree = renderer
      .create(
        <Menu>
          <MenuTrigger>
            <Button>Default</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open', () => {
    const tree = renderer
      .create(
        <Menu open>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu defaultOpen', () => {
    const tree = renderer
      .create(
        <Menu defaultOpen>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
              <MenuItem disabled>Option 2</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox and divider', () => {
    const tree = renderer
      .create(
        <Menu open>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemCheckbox name="Option 1">Option 1</MenuItemCheckbox>
              <MenuDivider />
              <MenuItemCheckbox disabled name="Option 2">
                Option 2
              </MenuItemCheckbox>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open radio', () => {
    const tree = renderer
      .create(
        <Menu open>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemRadio name="Option 1">Option 1</MenuItemRadio>
              <MenuItemRadio name="Option 2">Option 2</MenuItemRadio>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox defaultChecked', () => {
    const tree = renderer
      .create(
        <Menu open defaultChecked={['Option 1']}>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemCheckbox name="Option 1">Option 1</MenuItemCheckbox>
              <MenuDivider />
              <MenuItemCheckbox name="Option 2">Option 2</MenuItemCheckbox>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox checked', () => {
    const tree = renderer
      .create(
        <Menu open checked={['Option 1']}>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItemCheckbox name="Option 1">Option 1</MenuItemCheckbox>
              <MenuDivider />
              <MenuItemCheckbox name="Option 2">Option 2</MenuItemCheckbox>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu submenu', () => {
    const tree = renderer
      .create(
        <Menu open>
          <MenuTrigger>
            <Button>Default</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
              <Menu>
                <MenuTrigger>
                  <MenuItem>Option 2</MenuItem>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem>Option 1</MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </MenuList>
          </MenuPopover>
        </Menu>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Menu rerender tests', () => {
  it('Menu re-renders correctly', () => {
    checkReRender(
      () => (
        <Menu open>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      3,
    );
  });

  it('Menu re-renders correctly with style', () => {
    const style = { backgroundColor: 'black' };
    checkReRender(
      () => (
        <Menu>
          <MenuTrigger>
            <Button style={style}>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      3,
    );
  });

  it('Menu re-renders correctly with accessibilityAction', () => {
    const action = [{ name: 'Expand' as AccessibilityActionName }];
    checkReRender(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem accessibilityActions={action}>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      3,
    );
  });
});
