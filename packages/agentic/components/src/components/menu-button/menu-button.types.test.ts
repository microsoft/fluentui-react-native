/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import type { View } from 'react-native';

import type { MenuButtonProps } from './menu-button.types';
import { MenuButton } from './menu-button';

const validProps: MenuButtonProps = {
  appearance: 'primary',
  children: null,
  content: 'New',
  defaultOpen: false,
  disabled: false,
  icon: { fontSource: { codepoint: 0x2b } },
  menu: { accessibilityLabel: 'New', testID: 'menu' },
  onOpenChange: (open, { reason }) => [open, reason],
  ref: null as unknown as React.Ref<View>,
  size: 'large',
  submenuOpenOnHover: false,
};

// @ts-expect-error MenuButton has no selected axis.
const selected: MenuButtonProps = { children: null, selected: true };

// @ts-expect-error MenuButton has no shape axis.
const shape: MenuButtonProps = { children: null, shape: 'circle' };

// @ts-expect-error The chevron position is fixed, so there is no icon position.
const iconPosition: MenuButtonProps = { children: null, iconPosition: 'after' };

// @ts-expect-error Menu rows are required.
const missingChildren: MenuButtonProps = { content: 'New' };

describe('MenuButton types', () => {
  it('accepts the documented public contract', () => {
    expect(MenuButton).toBeDefined();
    expect(validProps).toBeDefined();
  });
});
