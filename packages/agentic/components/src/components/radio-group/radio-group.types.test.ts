/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import type { Pressable, View } from 'react-native';
import type { RadioGroupProps, RadioGroupSlots } from './radio-group.types';
import type { RadioGroupItemProps, RadioGroupItemSlots } from './radio-group-item.types';
import type { Slot } from '@fluentui-react-native/framework-base';

const groupRef = React.createRef<React.ComponentRef<typeof View>>();
const itemRef = React.createRef<React.ComponentRef<typeof Pressable>>();
const uncontrolled: RadioGroupProps = { label: 'Delivery', children: [], ref: groupRef, defaultSelectedValue: null };
const controlled: RadioGroupProps = {
  label: 'Delivery',
  children: [],
  selectedValue: null,
  orientation: 'horizontal',
  direction: 'rtl',
  onSelectionChange: (_value: string | null) => undefined,
  accessibilityState: { busy: true },
};
const item: RadioGroupItemProps = { value: 'one', label: 'One', ref: itemRef, secondaryText: 'Details', showSecondaryText: true };
const cleanupRef: RadioGroupItemProps = { value: 'two', label: 'Two', ref: (_node) => () => undefined };

// @ts-expect-error a question is required.
const missingLabel: RadioGroupProps = { children: [] };
// @ts-expect-error children are required.
const missingChildren: RadioGroupProps = { label: 'Delivery' };
// @ts-expect-error membership identity is required.
const missingValue: RadioGroupItemProps = { label: 'One' };
// @ts-expect-error the item name is required.
const missingItemLabel: RadioGroupItemProps = { value: 'one' };
// @ts-expect-error selected is collection-owned.
const selectedItem: RadioGroupItemProps = { value: 'one', label: 'One', selected: true };
// @ts-expect-error item children cannot replace the Radio anatomy.
const itemChildren: RadioGroupItemProps = { value: 'one', label: 'One', children: 'text' };
// @ts-expect-error group focusability is owned.
const focusableGroup: RadioGroupProps = { label: 'Delivery', children: [], focusable: true };
// @ts-expect-error item focusability is owned.
const focusableItem: RadioGroupItemProps = { value: 'one', label: 'One', focusable: true };
// @ts-expect-error no cross-desktop label relation is exposed.
const relation: RadioGroupProps = { label: 'Delivery', children: [], accessibilityLabelledBy: 'legend' };
// @ts-expect-error native selected state cannot differ from checked.
const selectedState: RadioGroupItemProps = { value: 'one', label: 'One', accessibilityState: { selected: true } };
// @ts-expect-error no arbitrary navigation descriptors.
const navigation: RadioGroupItemProps = { value: 'one', label: 'One', keyDownEvents: [] };
// @ts-expect-error unsupported layout axes.
const diagonal: RadioGroupProps = { label: 'Delivery', children: [], orientation: 'diagonal' };
// @ts-expect-error selection is string or null.
const numeric: RadioGroupProps = { label: 'Delivery', children: [], selectedValue: 0 };
// @ts-expect-error required is not native group accessibility state.
const requiredState: RadioGroupProps = { label: 'Delivery', children: [], accessibilityState: { required: true } };

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
const rootSlot: Expect<Equal<RadioGroupSlots['root'], Slot<typeof View>>> = true;
const itemSlot: Expect<Equal<RadioGroupItemSlots['root'], Slot<typeof Pressable>>> = true;

describe('RadioGroup prop types', () => {
  it('accepts nullable controlled state, native root/item refs and declared slots', () => {
    expect(uncontrolled).toBeDefined();
    expect(controlled).toBeDefined();
    expect(item).toBeDefined();
    expect(cleanupRef).toBeDefined();
    expect(rootSlot && itemSlot).toBe(true);
  });
});
