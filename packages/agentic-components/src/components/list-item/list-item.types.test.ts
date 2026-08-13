/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';
import type { Text, View } from 'react-native';

import type { Icon } from '../../primitives/icon/icon';
import type { ListItemProps, ListItemStateProps } from './list-item.types';
import type { ListItem } from './list-item';

const PrimaryTextSlot: SlotProp<typeof Text> = 'List item';
const SecondaryTextSlot: SlotProp<typeof Text> = { children: 'Secondary' };
const IconSlot: SlotProp<typeof Icon> = {
  fontSource: { codepoint: 0x2605, fontFamily: 'Arial' },
  height: 20,
  width: 20,
};
const AvatarSlot: SlotProp<typeof View> = {
  children: 'A',
};

const ListItemPropsValue: ListItemProps = {
  content: PrimaryTextSlot,
  secondaryContent: SecondaryTextSlot,
  selectionMode: 'single',
  selected: false,
  size: 'medium',
  icon: IconSlot,
  avatar: AvatarSlot,
  trailing: { children: 'Actions' },
};

const ListItemSlot: SlotProp<typeof ListItem> = {
  content: 'Row',
  selectionMode: 'multiple',
};

const BadSelectionMode: ListItemStateProps = {
  // @ts-expect-error Invalid selection mode should be rejected.
  selectionMode: 'option',
};

describe('ListItem types', () => {
  it('accepts content, secondary content, icon, avatar, trailing, and slot usage', () => {
    expect(PrimaryTextSlot).toBeDefined();
    expect(SecondaryTextSlot).toBeDefined();
    expect(IconSlot).toBeDefined();
    expect(AvatarSlot).toBeDefined();
    expect(ListItemPropsValue).toBeDefined();
    expect(ListItemSlot).toBeDefined();
    expect(BadSelectionMode).toBeDefined();
  });
});
