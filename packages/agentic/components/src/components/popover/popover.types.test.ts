/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import type { View } from 'react-native';

import type { PopoverAlign, PopoverOpenChangeReason, PopoverPlacement, PopoverProps, PopoverSurfaceProps } from './popover.types';
import { Popover } from './popover';

const placements: PopoverPlacement[] = ['top', 'bottom', 'start', 'end'];
const alignments: PopoverAlign[] = ['start', 'center', 'end'];
const reasons: PopoverOpenChangeReason[] = ['trigger', 'dismiss'];

const surface: PopoverSurfaceProps = { accessibilityLabel: 'Details', ref: null as unknown as React.Ref<View>, testID: 'surface' };

const validProps: PopoverProps = {
  align: 'center',
  children: null,
  defaultOpen: false,
  onOpenChange: (open: boolean, data: { reason: PopoverOpenChangeReason }) => [open, data.reason],
  open: true,
  placement: 'bottom',
  ref: null as unknown as React.Ref<View>,
  surface,
  trigger: { appearance: 'primary', content: 'Details' },
};

// @ts-expect-error The trigger is required.
const missingTrigger: PopoverProps = { children: null };

// @ts-expect-error Popover content is required.
const missingChildren: PopoverProps = { trigger: { content: 'Details' } };

// @ts-expect-error The surface is the native popup attachment and cannot be replaced.
const replacedSurface: PopoverSurfaceProps = { as: () => null };

// @ts-expect-error Popover has no arrow, appearance, or size axis.
const visualAxis: PopoverProps = { trigger: { content: 'Details' }, children: null, appearance: 'primary' };

// @ts-expect-error Only logical placements are accepted.
const physicalPlacement: PopoverPlacement = 'left';

describe('Popover types', () => {
  it('accepts the documented public contract', () => {
    expect(Popover).toBeDefined();
    expect([validProps, placements, alignments, reasons]).toBeDefined();
  });
});
