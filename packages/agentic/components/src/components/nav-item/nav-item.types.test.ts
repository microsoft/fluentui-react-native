/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { NavItem } from './nav-item';
import type { NavItemProps } from './nav-item.types';

const DestinationRow: SlotProp<typeof NavItem> = {
  icon: { fontSource: { codepoint: 0x2709, fontFamily: 'Arial' }, testID: 'inbox-icon' },
  label: 'Inbox',
  selected: true,
  selectedIcon: { fontSource: { codepoint: 0x2709, fontFamily: 'Arial' } },
  trailingContent: '12',
};

const CategoryRow: SlotProp<typeof NavItem> = {
  controls: 'mail-group',
  density: 'compact',
  expanded: true,
  label: 'Mail',
  type: 'category',
};

const SubItemRow: SlotProp<typeof NavItem> = {
  label: 'Focused',
  nesting: 'subItem',
};

const AvatarRow: SlotProp<typeof NavItem> = {
  avatar: { initials: 'CS', size: 20 },
  label: 'Cameron Sterling',
};

const RailRow: SlotProp<typeof NavItem> = {
  accessibilityLabel: 'Inbox',
  icon: { fontSource: { codepoint: 0x2709, fontFamily: 'Arial' } },
  showLabel: false,
};

const ReplacementNavItem = (_props: NavItemProps) => null;
const ReplacementNavItemSlot: SlotProp<typeof NavItem> = {
  as: ReplacementNavItem,
  label: 'Inbox',
};

// @ts-expect-error density only accepts the documented values.
const InvalidDensity: SlotProp<typeof NavItem> = { density: 'cozy', label: 'Inbox' };

// @ts-expect-error nesting only accepts the documented values.
const InvalidNesting: SlotProp<typeof NavItem> = { label: 'Inbox', nesting: 'nested' };

// @ts-expect-error type only accepts the documented values.
const InvalidType: SlotProp<typeof NavItem> = { label: 'Inbox', type: 'group' };

// @ts-expect-error a collapsed rail row requires an accessibilityLabel.
const RailWithoutLabel: SlotProp<typeof NavItem> = {
  icon: { fontSource: { codepoint: 0x2709, fontFamily: 'Arial' } },
  showLabel: false,
};

// @ts-expect-error a collapsed rail row cannot render a visible label.
const RailWithLabel: SlotProp<typeof NavItem> = {
  accessibilityLabel: 'Inbox',
  label: 'Inbox',
  showLabel: false,
};

describe('NavItem slot types', () => {
  it('accepts destination, category, sub-item, avatar, rail, and replacement rows', () => {
    expect(DestinationRow).toBeDefined();
    expect(CategoryRow).toBeDefined();
    expect(SubItemRow).toBeDefined();
    expect(AvatarRow).toBeDefined();
    expect(RailRow).toBeDefined();
    expect(ReplacementNavItemSlot).toBeDefined();
  });
});
