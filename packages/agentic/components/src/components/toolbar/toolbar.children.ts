import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Divider } from '../divider/divider';
import type { DividerProps } from '../divider/divider.types';
import { ToolbarButton } from './toolbar-button';
import type { ToolbarButtonProps } from './toolbar-button.types';
import type { ToolbarDirection, ToolbarProps } from './toolbar.types';

export type ToolbarItem = { value: string; disabled: boolean };
export type ToolbarInventory = { items: ToolbarItem[]; errors: string[] };

const forbiddenCommandProps = [
  'appearance',
  'size',
  'shape',
  'content',
  'iconPosition',
  'children',
  'focusable',
  'tabIndex',
  'role',
  'accessibilityRole',
  'accessible',
  'keyDownEvents',
  'keyUpEvents',
  'validKeysDown',
  'validKeysUp',
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
  'aria-disabled',
  'aria-checked',
  'accessibilityElementsHidden',
  'importantForAccessibility',
];
export const forbiddenToolbarRootProps = [
  'role',
  'accessibilityRole',
  'accessible',
  'focusable',
  'tabIndex',
  'keyDownEvents',
  'keyUpEvents',
  'validKeysDown',
  'validKeysUp',
  'orientation',
  'wrap',
  'overflow',
  'disabled',
  'selected',
  'defaultSelected',
  'onSelectionChange',
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
  'accessibilityElementsHidden',
  'importantForAccessibility',
];

function forbiddenProp(props: object, names: readonly string[]): string | undefined {
  return names.find((name) => Object.hasOwn(props, name));
}

function isNamed(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function styleError(style: StyleProp<ViewStyle>, direction?: ToolbarDirection): string | undefined {
  if (typeof style === 'function') return 'style callbacks are unsupported';
  const resolved = StyleSheet.flatten(style);
  if (!resolved) return undefined;
  if (resolved.display === 'none' || resolved.opacity === 0) return 'hidden registered controls are unsupported';
  if (resolved.flexDirection && resolved.flexDirection !== 'row') return 'layout must remain a horizontal row';
  if (resolved.flexWrap && resolved.flexWrap !== 'nowrap') return 'multiple rows are unsupported';
  if (direction && resolved.direction && resolved.direction !== 'inherit' && resolved.direction !== direction) {
    return 'style direction conflicts with navigation direction';
  }
  return undefined;
}

export function getToolbarButtonError(props: ToolbarButtonProps): string | undefined {
  const forbidden = forbiddenProp(props, forbiddenCommandProps);
  if (forbidden) return `unsupported prop "${forbidden}"`;
  if (!isNamed(props.value)) return 'a nonempty value is required';
  if (!isNamed(props.accessibilityLabel)) return 'a nonempty accessibilityLabel is required';
  if (props.icon == null) return 'an icon is required';
  if (props.disabled !== undefined && typeof props.disabled !== 'boolean') return 'disabled must be a boolean';
  if (props.selected !== undefined && typeof props.selected !== 'boolean') return 'selected must be a boolean when supplied';
  if (
    props.accessibilityState &&
    (Object.hasOwn(props.accessibilityState, 'checked') || Object.hasOwn(props.accessibilityState, 'disabled'))
  ) {
    return 'checked and disabled accessibility state belong to the command props';
  }
  return styleError(props.style);
}

export function getToolbarInventory(props: ToolbarProps, direction: ToolbarDirection): ToolbarInventory {
  const items: ToolbarItem[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const forbidden = forbiddenProp(props, forbiddenToolbarRootProps);
  if (forbidden) errors.push(`root: unsupported prop "${forbidden}"`);
  if (!isNamed(props.accessibilityLabel)) errors.push('root: a nonempty accessibilityLabel is required');
  if (props.size !== undefined && props.size !== 'small' && props.size !== 'large') errors.push('root: unsupported size');
  if (props.direction !== undefined && props.direction !== 'ltr' && props.direction !== 'rtl') errors.push('root: unsupported direction');
  const rootStyleError = styleError(props.style, direction);
  if (rootStyleError) errors.push(`root: ${rootStyleError}`);

  const visit = (children: React.ReactNode) => {
    React.Children.forEach(children, (child) => {
      if (child == null || typeof child === 'boolean') return;
      if (!React.isValidElement(child)) {
        errors.push('child: only ToolbarButton, Divider, and Fragments are supported');
      } else if (child.type === React.Fragment) {
        const fragmentProps = child.props as { children?: React.ReactNode };
        visit(fragmentProps.children);
      } else if (child.type === ToolbarButton) {
        const commandProps = child.props as ToolbarButtonProps;
        const error = getToolbarButtonError(commandProps);
        if (error) errors.push(`command "${commandProps.value ?? '(missing)'}": ${error}`);
        if (seen.has(commandProps.value)) errors.push(`command "${commandProps.value}": duplicate value`);
        seen.add(commandProps.value);
        items.push({ value: commandProps.value, disabled: Boolean(commandProps.disabled) });
      } else if (child.type === Divider) {
        const dividerProps = child.props as DividerProps;
        if (dividerProps.vertical !== true || dividerProps.label !== null || dividerProps.icon != null) {
          errors.push('Divider: require vertical={true}, label={null}, and no icon');
        }
        const dividerStyle = StyleSheet.flatten(dividerProps.style);
        if (dividerStyle?.display === 'none') errors.push('Divider: hidden separators are unsupported');
      } else {
        const name = typeof child.type === 'string' ? child.type : 'custom/nested component';
        errors.push(`child "${name}": only direct ToolbarButton and Divider are supported`);
      }
    });
  };
  visit(props.children);
  return { items: errors.length ? [] : items, errors };
}
