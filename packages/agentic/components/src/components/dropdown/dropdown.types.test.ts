/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as React from 'react';
import type { View } from 'react-native';

import type {
  DropdownListboxProps,
  DropdownOpenChangeReason,
  DropdownProps,
  DropdownSelectionChangeData,
  DropdownSize,
  DropdownVariant,
} from './dropdown.types';
import { Dropdown } from './dropdown';

const variants: DropdownVariant[] = ['outline', 'underline'];
const sizes: DropdownSize[] = ['small', 'medium', 'large'];
const reasons: DropdownOpenChangeReason[] = ['trigger', 'dismiss', 'select'];

const listbox: DropdownListboxProps = { accessibilityLabel: 'Fruit', ref: null as unknown as React.Ref<View>, testID: 'list' };

const validProps: DropdownProps = {
  accessibilityLabel: 'Fruit',
  children: null,
  defaultOpen: false,
  defaultSelectedOptions: ['apple'],
  disabled: false,
  error: true,
  formatSelectedCount: (count: number) => `${count} fruits`,
  listbox,
  multiselect: true,
  onOpenChange: (open: boolean, data: { reason: DropdownOpenChangeReason }) => [open, data.reason],
  onPressIn: () => undefined,
  onSelectedOptionsChange: (selected: string[], data: DropdownSelectionChangeData) => [selected, data.value],
  open: true,
  placeholder: 'Pick a fruit',
  ref: null as unknown as React.Ref<View>,
  selectedOptions: ['apple', 'pear'],
  size: 'small',
  trigger: { testID: 'trigger', accessibilityHint: 'Opens the list' },
  variant: 'underline',
};

// @ts-expect-error Options are required.
const missingChildren: DropdownProps = { accessibilityLabel: 'Fruit' };

// @ts-expect-error The list surface is the native popup attachment and cannot be replaced.
const replacedListbox: DropdownListboxProps = { as: () => null };

// @ts-expect-error The trigger draws Dropdown's own content.
const triggerChildren: DropdownProps = { children: null, trigger: { children: null } };

// @ts-expect-error Dropdown has Input's variants, not Button appearances.
const appearance: DropdownVariant = 'subtle';

// @ts-expect-error Selected options are string values.
const numericSelection: DropdownProps = { children: null, selectedOptions: [1] };

describe('Dropdown types', () => {
  it('accepts the documented public contract', () => {
    expect(Dropdown).toBeDefined();
    expect([validProps, variants, sizes, reasons, listbox]).toBeDefined();
  });
});
