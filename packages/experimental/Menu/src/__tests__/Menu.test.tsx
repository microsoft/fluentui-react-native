import * as React from 'react';
import { Menu } from '../Menu/Menu';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import MenuTrigger from '../MenuTrigger/MenuTrigger';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import MenuPopover from '../MenuPopover/MenuPopover';
import { MenuList } from '../MenuList/MenuList';
import { MenuItem } from '../MenuItem/MenuItem';
import { AccessibilityActionName } from 'react-native';

describe('Checkbox component tests', () => {
  it('Menu simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem content="Option 1" />
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      2,
    );
  });

  it('Checkbox re-renders correctly', () => {
    checkReRender(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem content="Option 1" />
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      2,
    );
  });

  it('Checkbox shares produced styles across multiple renders', () => {
    const style = { backgroundColor: 'black' };
    checkRenderConsistency(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList style={style}>
              <MenuItem content="Option 1" />
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      2,
    );
  });

  it('Checkbox re-renders correctly with style', () => {
    checkReRender(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover borderColor={'blue'}>
            <MenuList>
              <MenuItem content="Option 1" />
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      2,
    );
  });

  it('Checkbox re-renders correctly with accessibilityAction', () => {
    const action = [{ name: 'Expand' as AccessibilityActionName }];
    checkReRender(
      () => (
        <Menu>
          <MenuTrigger>
            <Button>Rerender twice</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem accessibilityActions={action} content="Option 1" />
            </MenuList>
          </MenuPopover>
        </Menu>
      ),
      2,
    );
  });
});
