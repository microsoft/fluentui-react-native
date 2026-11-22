/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import type { View } from 'react-native';

import type { Icon } from '../../primitives/icon/icon';
import type { MenuItemProps } from './menu-item.types';
import { MenuItem } from './menu-item';

const IconSlot: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, height: 20, width: 20 };
const AvatarSlot: SlotProp<typeof View> = { testID: 'avatar' };

const validProps: MenuItemProps = {
  disabledFocusable: true,
  content: 'Menu item',
  icon: IconSlot,
  avatar: AvatarSlot,
  selectionMode: 'single',
  selected: true,
  secondaryContent: 'Secondary',
};

// @ts-expect-error A selection indicator owns the trailing position.
const invalidIndicator: MenuItemProps = { selectionMode: 'multiple', trailingIcon: IconSlot };
// @ts-expect-error A submenu chevron owns the trailing position.
const invalidSubmenu: MenuItemProps = { submenu: { children: null }, trailingIcon: IconSlot };

describe('MenuItem types', () => {
  it('accepts the expected slot props', () => {
    expect(MenuItem).toBeDefined();
    expect(validProps).toBeDefined();
  });
});
