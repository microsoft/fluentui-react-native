import { ButtonV1 } from '@fluentui-react-native/button';
import { Menu, MenuPopover, MenuTrigger, MenuItem } from '@fluentui-react-native/menu';
import * as renderer from 'react-test-renderer';
import { act } from 'react';

import { Overflow, OverflowItem, useOverflowMenu } from '../';

const items = ['a', 'b', 'c'];

const OverflowMenu = () => {
  const state = useOverflowMenu();
  if (state.showMenu) {
    const itemCount = state.visibleMenuItems.length;
    return (
      <Menu>
        <MenuTrigger>
          <ButtonV1>{`+ ${itemCount} item${itemCount !== 1 ? 's' : ''}`}</ButtonV1>
        </MenuTrigger>
        <MenuPopover>
          {state.visibleMenuItems.map((item) => (
            <MenuItem key={item}>{item}</MenuItem>
          ))}
        </MenuPopover>
      </Menu>
    );
  }
  return null;
};

describe('Overflow component tests', () => {
  it('Overflow default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Overflow itemIDs={items}>
          {items.map((item) => (
            <OverflowItem key={item} overflowID={item}>
              <ButtonV1>{item}</ButtonV1>
            </OverflowItem>
          ))}
          <OverflowMenu />
        </Overflow>,
      );
    });
    const tree = component!.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
