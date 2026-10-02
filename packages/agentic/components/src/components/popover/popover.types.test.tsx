/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { Pressable } from 'react-native';
import { Text, View } from 'react-native';

import { directComponent } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Popover } from './popover';
import type { PopoverProps, PopoverState, PopoverTriggerProps } from './popover.types';
import { usePopover_unstable } from './usePopover';
import type { usePopoverStyles_unstable } from './usePopoverStyles';
import { renderPopover_unstable } from './renderPopover';

const replacement = directComponent<React.ComponentPropsWithRef<typeof View>>((props) => <View {...props} />);
const rootRef = React.createRef<View>();
const triggerRef = React.createRef<React.ComponentRef<typeof Pressable>>();
const contentRef = React.createRef<View>();
const content: SlotProp<typeof View> = { as: replacement, ref: contentRef, children: <Text>Details</Text> };
const props: PopoverProps = {
  ref: rootRef,
  trigger: { ref: triggerRef, children: <Text>Details</Text> },
  content,
  defaultOpen: false,
  onOpenChange: (open) => {
    const value: boolean = open;
    return value;
  },
  position: 'topLeftEdge',
  surfaceAccessibilityLabel: 'Details',
};
const cleanupRef: PopoverTriggerProps = { ref: () => () => undefined };
const empty: PopoverProps = { content: null, open: false };

type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
type SameAcceptance<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type OwnedRootKeys = 'focused' | 'accessibilityLabel' | 'role' | 'surface' | 'onRestoreFocus' | 'initialFocus';
type OwnedTriggerKeys = 'role' | 'accessibilityState' | 'aria-expanded' | 'aria-disabled' | 'focusable' | 'as';
const rootKeysExcluded: Assert<Equal<Extract<keyof PopoverProps, OwnedRootKeys>, never>> = true;
const triggerKeysExcluded: Assert<Equal<Extract<keyof PopoverTriggerProps, OwnedTriggerKeys>, never>> = true;
const rootRefMatches: Assert<SameAcceptance<PopoverProps['ref'], React.ComponentPropsWithRef<typeof View>['ref']>> = true;
const triggerRefMatches: Assert<SameAcceptance<PopoverTriggerProps['ref'], React.ComponentPropsWithRef<typeof Pressable>['ref']>> = true;

const hook: (props: PopoverProps) => PopoverState = usePopover_unstable;
const renderStage: (state: PopoverState, styles: ReturnType<typeof usePopoverStyles_unstable>) => React.JSX.Element =
  renderPopover_unstable;
const element = <Popover {...props} />;

describe('Popover types', () => {
  it('accepts public native refs, compatible content, open state, and composition stages', () => {
    expect(props.position).toBe('topLeftEdge');
    expect(empty.content).toBeNull();
    expect(cleanupRef.ref).toBeDefined();
    expect(hook).toBe(usePopover_unstable);
    expect(renderStage).toBe(renderPopover_unstable);
    expect(element).toBeDefined();
    expect([rootKeysExcluded, triggerKeysExcluded, rootRefMatches, triggerRefMatches]).toEqual([true, true, true, true]);
  });
});
