/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { View } from 'react-native';
import { Pressable } from 'react-native';
import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import { Toolbar } from './toolbar';
import { ToolbarButton } from './toolbar-button';
import type { ToolbarButtonProps } from './toolbar-button.types';
import type { ToolbarProps, ToolbarSize } from './toolbar.types';
import { Divider } from '../divider/divider';

const icon = { fontSource: { codepoint: 0x2b, fontFamily: 'Arial' } } as const;
const viewRef = React.createRef<React.ComponentRef<typeof View>>();
const pressableRef = React.createRef<React.ComponentRef<typeof Pressable>>();
const Host = (props: PropsWithRefOf<typeof Pressable>) => <Pressable {...props} />;

const Valid = (
  <Toolbar accessibilityLabel="Commands" size="small" direction="rtl" ref={viewRef}>
    <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={pressableRef} as={Host} />
    <Divider vertical label={null} />
    <ToolbarButton
      value="two"
      accessibilityLabel="Two"
      icon={icon}
      selected={false}
      onPress={() => undefined}
      onKeyDown={(event) => event.preventDefault?.()}
    />
  </Toolbar>
);
type Equal<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
type RequiredProp<T, K extends keyof T> = Record<never, never> extends Pick<T, K> ? false : true;
type OwnedScopeKeys = 'orientation' | 'overflow' | 'focusable' | 'tabIndex';
type OwnedCommandKeys = 'content' | 'appearance' | 'size' | 'keyDownEvents' | 'focusable' | 'defaultSelected' | 'aria-checked';
const scopeKeysExcluded: Assert<Equal<Extract<keyof ToolbarProps, OwnedScopeKeys>, never>> = true;
const commandKeysExcluded: Assert<Equal<Extract<keyof ToolbarButtonProps, OwnedCommandKeys>, never>> = true;
const requiredProps: [
  Assert<RequiredProp<ToolbarProps, 'children'>>,
  Assert<RequiredProp<ToolbarProps, 'accessibilityLabel'>>,
  Assert<RequiredProp<ToolbarButtonProps, 'value'>>,
  Assert<RequiredProp<ToolbarButtonProps, 'icon'>>,
  Assert<RequiredProp<ToolbarButtonProps, 'accessibilityLabel'>>,
] = [true, true, true, true, true];
const nativeScopeRef: Assert<Equal<ToolbarProps['ref'], PropsWithRefOf<typeof View>['ref']>> = true;
const nativeCommandRef: Assert<Equal<ToolbarButtonProps['ref'], PropsWithRefOf<typeof Pressable>['ref']>> = true;
// @ts-expect-error There is no medium Toolbar size.
const invalidSize: ToolbarSize = 'medium';

describe('Toolbar types', () => {
  it('accepts bounded icon commands, separator composition, scalar axes, native refs and compatible roots', () => {
    expect(Valid).toBeDefined();
    expect([scopeKeysExcluded, commandKeysExcluded, nativeScopeRef, nativeCommandRef]).toEqual([true, true, true, true]);
    expect(requiredProps).toEqual([true, true, true, true, true]);
    expect(invalidSize).toBe('medium');
  });
});
