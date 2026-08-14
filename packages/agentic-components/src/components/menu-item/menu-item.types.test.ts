/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import type { View } from 'react-native';

import type { Icon } from '../../primitives/icon/icon';
import type { MenuItemProps } from './menu-item.types';
import { MenuItem } from './menu-item';

const IconSlot: SlotProp<typeof Icon> = { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, height: 20, width: 20 };
const AvatarSlot: SlotProp<typeof View> = { testID: 'avatar' };

const validProps: MenuItemProps = {
  content: 'Menu item',
  icon: IconSlot,
  avatar: AvatarSlot,
  hasCheckmark: true,
  hasChevron: true,
  hasMultiselect: false,
  selected: true,
  secondaryContent: 'Secondary',
};

describe('MenuItem types', () => {
  it('accepts the expected slot props', () => {
    expect(MenuItem).toBeDefined();
    expect(validProps).toBeDefined();
  });
});
