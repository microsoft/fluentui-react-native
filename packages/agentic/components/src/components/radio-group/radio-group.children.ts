import * as React from 'react';

import { RadioGroupItem } from './radio-group-item';
import type { RadioGroupItemProps } from './radio-group-item.types';

export type RadioGroupMember = { value: string; disabled: boolean };

export function requireRadioGroupText(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`RadioGroup: ${name} must be a nonblank string.`);
  }
}

export function rejectRadioGroupOverrides(props: object, keys: readonly string[], component: string) {
  for (const key of keys) {
    if (key in props) throw new Error(`${component}: "${key}" is component-owned and cannot be supplied.`);
  }
}

export const ownedGroupNativeProps = [
  'accessible',
  'focusable',
  'tabIndex',
  'role',
  'accessibilityRole',
  'keyDownEvents',
  'keyUpEvents',
  'validKeysDown',
  'validKeysUp',
  'aria-checked',
  'aria-selected',
  'aria-disabled',
  'aria-required',
] as const;

export const ownedItemNativeProps = [
  ...ownedGroupNativeProps,
  'selected',
  'defaultSelected',
  'onSelectedChange',
  'accessibilityPosInSet',
  'accessibilitySetSize',
  'children',
] as const;

export function getRadioGroupMembers(children: React.ReactNode, disabled: boolean): RadioGroupMember[] {
  const members: RadioGroupMember[] = [];
  const values = new Set<string>();
  const visit = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (child == null || typeof child === 'boolean') return;
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
        visit(child.props.children);
        return;
      }
      if (!React.isValidElement<RadioGroupItemProps>(child) || child.type !== RadioGroupItem) {
        throw new Error('RadioGroup: only direct RadioGroupItem children, arrays, Fragments and conditional placeholders are supported.');
      }
      const { value, label } = child.props;
      requireRadioGroupText(value, 'item value');
      requireRadioGroupText(label, `label for "${value}"`);
      if (values.has(value)) throw new Error(`RadioGroup: duplicate item value "${value}".`);
      values.add(value);
      members.push({ value, disabled: disabled || Boolean(child.props.disabled) });
    });
  };
  visit(children);
  if (members.length < 2 || members.length > 5) {
    throw new Error(`RadioGroup: expected two through five items, received ${members.length}.`);
  }
  return members;
}
