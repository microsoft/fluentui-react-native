/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import type { View } from 'react-native';

import type { MenuItemSubmenuProps } from '../menu-item/menu-item.types';
import type { MenuAlign, MenuOpenChangeReason, MenuPlacement, MenuProps, MenuSurfaceProps } from './menu.types';
import { Menu } from './menu';

const placements: MenuPlacement[] = ['top', 'bottom', 'start', 'end'];
const alignments: MenuAlign[] = ['start', 'center', 'end'];
const reasons: MenuOpenChangeReason[] = ['trigger', 'dismiss', 'action'];

const surface: MenuSurfaceProps = { accessibilityLabel: 'Edit', ref: null as unknown as React.Ref<View>, testID: 'surface' };
const submenu: MenuItemSubmenuProps = { accessibilityLabel: 'Share', children: null, testID: 'share' };

const validProps: MenuProps = {
  align: 'start',
  children: null,
  defaultOpen: false,
  disabledFocusable: true,
  onOpenChange: (open: boolean, data: { reason: MenuOpenChangeReason }) => [open, data.reason],
  open: true,
  placement: 'bottom',
  ref: null as unknown as React.Ref<View>,
  submenuCloseDelay: 300,
  submenuOpenDelay: 100,
  submenuOpenOnHover: true,
  surface,
  trigger: { appearance: 'subtle', content: 'Edit' },
};

// @ts-expect-error The trigger is required.
const missingTrigger: MenuProps = { children: null };

// @ts-expect-error Menu rows are required.
const missingChildren: MenuProps = { trigger: { content: 'Edit' } };

// @ts-expect-error The surface is the native popup attachment and cannot be replaced.
const replacedSurface: MenuSurfaceProps = { as: () => null };

// @ts-expect-error A submenu requires its rows.
const emptySubmenu: MenuItemSubmenuProps = { testID: 'share' };

// @ts-expect-error Menu has no appearance or size axis.
const visualAxis: MenuProps = { trigger: { content: 'Edit' }, children: null, appearance: 'primary' };

// @ts-expect-error Only logical placements are accepted.
const physicalPlacement: MenuPlacement = 'left';

describe('Menu types', () => {
  it('accepts the documented public contract', () => {
    expect(Menu).toBeDefined();
    expect([validProps, placements, alignments, reasons, submenu]).toBeDefined();
  });
});
