import { ButtonV1 as Button } from '@fluentui-react-native/button';
import * as renderer from 'react-test-renderer';
import { act } from 'react';

import { Menu } from '../Menu/Menu';
import { MenuDivider } from '../MenuDivider/MenuDivider';
import { MenuGroup } from '../MenuGroup';
import { MenuGroupHeader } from '../MenuGroupHeader';
import { MenuItem } from '../MenuItem/MenuItem';
import { MenuItemCheckbox } from '../MenuItemCheckbox/MenuItemCheckbox';
import { MenuItemRadio } from '../MenuItemRadio/MenuItemRadio';
import { MenuList } from '../MenuList/MenuList';
import MenuPopover from '../MenuPopover/MenuPopover';
import MenuTrigger from '../MenuTrigger/MenuTrigger';

describe('Menu component tests', () => {
  it('Menu default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu defaultOpen', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Menu defaultOpen>
          <MenuTrigger>
            <Button>Open</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Option 1</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>,
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu defaultOpen with disabled', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox and divider', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open radio', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox defaultChecked', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu open checkbox checked', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Menu submenu', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });

  // Note the capital T the "Tip" (in the snapshot)
  // It is intentional as it matches the same prop in NetUI
  it('Menu alwaysShowToolTip', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Menu>
          <MenuTrigger>
            <Button tooltip="A Tooltip">Button</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem>Test</MenuItem>
              <MenuItem tooltip="Second">With Tooltip</MenuItem>
              <MenuItemRadio name="Radio" tooltip="Third">
                Radio Tooltip
              </MenuItemRadio>
              <MenuItemCheckbox name="Check" tooltip="Fourth">
                Checkbox Tooltip
              </MenuItemCheckbox>
            </MenuList>
          </MenuPopover>
        </Menu>,
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

it('Menu open menu group and menu header', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(
      <Menu open>
        <MenuTrigger>
          <Button>Open</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuGroup>
              <MenuGroupHeader>Header 1</MenuGroupHeader>
              <MenuItem>Option 1</MenuItem>
            </MenuGroup>
            <MenuDivider></MenuDivider>
            <MenuGroup>
              <MenuGroupHeader>Header 2</MenuGroupHeader>
              <MenuItem>Option 1</MenuItem>
            </MenuGroup>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );
  });
  const tree = component!.toJSON();
  expect(tree).toMatchSnapshot();
});
