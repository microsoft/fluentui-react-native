/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { I18nManager, Platform, Pressable, StyleSheet, View } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';
import type { FocusKeyboardEvent, FocusTarget, PropsWithRefOf } from '@fluentui-react-native/framework-base';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { render } from '../../common/renderWithTheme';
import { Button } from '../button/button';
import { Divider } from '../divider/divider';
import { Input } from '../input/input';
import { Toolbar } from './toolbar';
import { ToolbarButton } from './toolbar-button';
import { ToolbarContext } from './ToolbarContext';
import type { ToolbarContextValue } from './ToolbarContext';
import type { ToolbarProps } from './toolbar.types';
import { getToolbarKeyProps } from './toolbar.keyboard';

const icon = { fontSource: { codepoint: 0x2b, fontFamily: 'Arial' } } as const;

function keyEvent(key: string, extras: Partial<FocusKeyboardEvent['nativeEvent']> = {}) {
  return {
    nativeEvent: { key, code: key === ' ' ? 'Space' : key, ...extras },
    target: 1,
    currentTarget: 1,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation: jest.fn(),
  };
}

function commands(result: RenderResult) {
  return result.queryAllByRole('button');
}
function stops(result: RenderResult) {
  return commands(result).map((command) => command.props.focusable);
}
function scene(props: Partial<ToolbarProps> = {}) {
  return (
    <Toolbar accessibilityLabel="Actions" {...props}>
      <ToolbarButton accessibilityLabel="One" icon={icon} value="one" testID="one" />
      <ToolbarButton accessibilityLabel="Unavailable" icon={icon} value="disabled" disabled />
      <Divider vertical label={null} />
      <ToolbarButton accessibilityLabel="Two" icon={icon} value="two" testID="two" />
      <ToolbarButton accessibilityLabel="Three" icon={icon} value="three" testID="three" />
    </Toolbar>
  );
}

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

describe('Toolbar', () => {
  it('uses one command entry, preserves grouping, separator and child names, and owns no surface', async () => {
    const result = await render(scene());
    const root = result.getByRole('toolbar');
    expect(root.props).toMatchObject({ accessibilityLabel: 'Actions', accessible: true, focusable: false });
    expect(stops(result)).toEqual([true, false, false, false]);
    expect(commands(result).map((node) => node.props.accessibilityLabel)).toEqual(['One', 'Unavailable', 'Two', 'Three']);
    expect(result.getByRole('separator').props.focusable).toBe(false);
    expect(result.queryByText('Text')).toBeNull();
    const style = StyleSheet.flatten(root.props.style);
    expect(style).toMatchObject({ flexDirection: 'row', flexWrap: 'nowrap', direction: I18nManager.isRTL ? 'rtl' : 'ltr' });
    for (const key of ['backgroundColor', 'borderWidth', 'borderRadius', 'height', 'padding', 'elevation']) {
      expect(style[key]).toBeUndefined();
    }
  });

  it.each(['small', 'large'] as const)('maps %s gap/child sizes and applies user styles last', async (size) => {
    const result = await render(scene({ size, style: { gap: 99, width: 240, margin: 7 } }));
    expect(StyleSheet.flatten(result.getByRole('toolbar').props.style)).toMatchObject({ gap: 99, width: 240, margin: 7 });
    await result.rerender(scene({ size }));
    const gap = size === 'small' ? defaultFlexTokens.spacing.componentBase50 : defaultFlexTokens.spacing.componentBase150;
    expect(StyleSheet.flatten(result.getByRole('toolbar').props.style).gap).toBe(gap);
    expect(StyleSheet.flatten(commands(result)[0].props.style)).toMatchObject({ minWidth: 24, minHeight: 24 });
    const leaf = await render(<Button accessibilityLabel="Leaf" icon={icon} appearance="subtle" size={size} />);
    expect(StyleSheet.flatten(commands(result)[0].props.style)).toEqual(StyleSheet.flatten(leaf.getByRole('button').props.style));
  });

  it('supports arrays, recursive Fragments and conditional placeholders in logical order', async () => {
    const result = await render(
      <Toolbar accessibilityLabel="Nested fragments">
        {null}
        {false}
        <>
          <ToolbarButton value="one" accessibilityLabel="One" icon={icon} />
          <>
            <Divider vertical label={null} />
          </>
        </>
        {[<ToolbarButton key="two" value="two" accessibilityLabel="Two" icon={icon} />]}
      </Toolbar>,
    );
    expect(stops(result)).toEqual([true, false]);
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('ArrowRight'));
    expect(stops(result)).toEqual([false, true]);
  });

  it.each([
    ['ltr', 'ArrowRight', 'ArrowLeft'],
    ['rtl', 'ArrowLeft', 'ArrowRight'],
  ] as const)('maps %s arrows, skips disabled/separators, wraps and supports Home/End', async (direction, next, previous) => {
    const result = await render(scene({ direction }));
    for (const [source, key, destination] of [
      [0, next, 2],
      [2, next, 3],
      [3, next, 0],
      [0, previous, 3],
      [3, 'Home', 0],
      [0, 'End', 3],
    ] as const) {
      const event = keyEvent(key);
      await fireEvent(commands(result)[source], 'keyDown', event);
      expect(stops(result)).toEqual([0, 1, 2, 3].map((index) => index === destination));
      expect(event.defaultPrevented).toBe(true);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    }
    expect(StyleSheet.flatten(result.getByRole('toolbar').props.style).direction).toBe(direction);
  });

  it.each(['ArrowUp', 'ArrowDown', 'Tab', 'Escape', 'x'])('does not consume %s', async (key) => {
    const handler = jest.fn();
    const result = await render(
      <Toolbar accessibilityLabel="Commands">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} onKeyDown={handler} />
        <ToolbarButton value="two" accessibilityLabel="Two" icon={icon} />
      </Toolbar>,
    );
    const event = keyEvent(key);
    await fireEvent(commands(result)[0], 'keyDown', event);
    expect(handler).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(stops(result)).toEqual([true, false]);
  });

  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const)('forwards %s navigation without moving the entry', async (modifier) => {
    const result = await render(scene());
    const event = keyEvent('ArrowRight', { [modifier]: true });
    await fireEvent(commands(result)[0], 'keyDown', event);
    expect(stops(result)).toEqual([true, false, false, false]);
    expect(event.defaultPrevented).toBe(false);
  });

  it('honors caller cancellation and self-target identity', async () => {
    const onKeyDown = jest.fn((event: FocusKeyboardEvent) => event.preventDefault?.());
    const result = await render(
      <Toolbar accessibilityLabel="Commands">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} onKeyDown={onKeyDown} />
        <ToolbarButton value="two" accessibilityLabel="Two" icon={icon} />
      </Toolbar>,
    );
    const cancelled = keyEvent('ArrowRight');
    await fireEvent(commands(result)[0], 'keyDown', cancelled);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(stops(result)).toEqual([true, false]);
    expect(cancelled.stopPropagation).not.toHaveBeenCalled();
    await result.rerender(scene());
    const descendant = { ...keyEvent('ArrowRight'), target: 2 };
    await fireEvent(commands(result)[0], 'keyDown', descendant);
    expect(stops(result)).toEqual([true, false, false, false]);
    expect(descendant.defaultPrevented).toBe(false);
  });

  it('uses code when the native key is Unidentified', async () => {
    const result = await render(scene());
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('Unidentified', { code: 'End' }));
    expect(stops(result)).toEqual([false, false, false, true]);
  });

  it('uses the native RTL setting when no local direction is supplied', async () => {
    const rtl = jest.replaceProperty(I18nManager, 'isRTL', true);
    try {
      const result = await render(scene());
      expect(StyleSheet.flatten(result.getByRole('toolbar').props.style).direction).toBe('rtl');
      await fireEvent(commands(result)[0], 'keyDown', keyEvent('ArrowLeft'));
      expect(stops(result)).toEqual([false, false, true, false]);
    } finally {
      rtl.restore();
    }
  });

  it('does not redundantly focus a single eligible command', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const result = await render(
      <Toolbar accessibilityLabel="Only">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={ref} />
      </Toolbar>,
    );
    const focus = jest.spyOn(ref.current!, 'focus').mockImplementation(() => undefined);
    for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) await fireEvent(commands(result)[0], 'keyDown', keyEvent(key));
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it('retains external selection, checked presence, event identity, and optional selected icon', async () => {
    const onPress = jest.fn();
    const onAccessibilityAction = jest.fn();
    const result = await render(
      <Toolbar accessibilityLabel="Commands">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} />
        <ToolbarButton
          value="two"
          accessibilityLabel="Two"
          icon={icon}
          selected={false}
          selectedIcon={{ fontSource: { codepoint: 0x2d, fontFamily: 'Arial' } }}
          accessibilityState={{ busy: true }}
          onPress={onPress}
          onAccessibilityAction={onAccessibilityAction}
        />
      </Toolbar>,
    );
    expect(commands(result)[0].props.accessibilityState.checked).toBeUndefined();
    expect(commands(result)[1].props.accessibilityState).toMatchObject({ busy: true, checked: false, disabled: false });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    expect(commands(result)[1].props.accessibilityState.checked).toBe(false);
    const pressEvent = { nativeEvent: {} };
    await fireEvent.press(commands(result)[1], pressEvent);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress.mock.calls[0][0]).toMatchObject({ nativeEvent: expect.any(Object) });
    expect(onPress.mock.calls[0][0].isDefaultPrevented).toEqual(expect.any(Function));
    expect(commands(result)[1].props.accessibilityState.checked).toBe(false);
    const action = { nativeEvent: { actionName: 'custom' } };
    await fireEvent(commands(result)[1], 'accessibilityAction', action);
    expect(onAccessibilityAction).toHaveBeenCalledWith(action);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the supplied selected icon and falls back to the normal icon without changing selection', async () => {
    const result = await render(
      <Toolbar accessibilityLabel="Selected">
        <ToolbarButton
          value="one"
          accessibilityLabel="One"
          icon={icon}
          selected
          selectedIcon={{ fontSource: { codepoint: 0x2d, fontFamily: 'Arial' } }}
        />
      </Toolbar>,
    );
    expect(result.getByText('-')).toBeDefined();
    expect(result.queryByText('+')).toBeNull();
    expect(commands(result)[0].props.accessibilityState.checked).toBe(true);
    await result.rerender(
      <Toolbar accessibilityLabel="Selected">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} selected />
      </Toolbar>,
    );
    expect(result.getByText('+')).toBeDefined();
    expect(commands(result)[0].props.accessibilityState.checked).toBe(true);
  });

  it('preserves Button activation and release timing without another Toolbar action', async () => {
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const onKeyUp = jest.fn();
    const result = await render(
      <Toolbar accessibilityLabel="Commands">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} onPress={onPress} onPressOut={onPressOut} onKeyUp={onKeyUp} />
      </Toolbar>,
    );
    const button = commands(result)[0];
    await fireEvent(button, 'keyDown', keyEvent('Enter'));
    if (Platform.OS === 'macos') expect(onPress).toHaveBeenCalledTimes(1);
    const release = keyEvent('Enter');
    await fireEvent(button, 'keyUp', release);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onKeyUp).toHaveBeenCalledWith(release);
    expect(onKeyUp).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it('removes all disabled commands from navigation while retaining disabled semantics', async () => {
    const result = await render(
      <Toolbar accessibilityLabel="Disabled">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} disabled />
        <ToolbarButton value="two" accessibilityLabel="Two" icon={icon} disabled />
      </Toolbar>,
    );
    expect(stops(result)).toEqual([false, false]);
    expect(commands(result).every((node) => node.props.accessibilityState.disabled)).toBe(true);
    expect(
      commands(result).every(
        (node) =>
          !node.props.keyDownEvents?.some((descriptor: { key?: string; code?: string }) =>
            ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(descriptor.key ?? descriptor.code ?? ''),
          ),
      ),
    ).toBe(true);
  });

  it('keeps child styles and root native props/handlers/refs without changing root identity', async () => {
    const rootRef = React.createRef<React.ComponentRef<typeof View>>();
    const commandRef = React.createRef<React.ComponentRef<typeof Pressable>>();
    const onLayout = jest.fn();
    const result = await render(
      <Toolbar accessibilityLabel="Commands" testID="scope" nativeID="scope-native" ref={rootRef} onLayout={onLayout}>
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={commandRef} style={{ margin: 4, minWidth: 40 }} />
      </Toolbar>,
    );
    expect(rootRef.current).not.toBeNull();
    expect(commandRef.current).not.toBeNull();
    expect(rootRef.current).not.toBe(commandRef.current);
    expect(result.getByTestId('scope').props.nativeID).toBe('scope-native');
    expect(StyleSheet.flatten(commands(result)[0].props.style)).toMatchObject({ margin: 4, minWidth: 40 });
    const event = { nativeEvent: { layout: { x: 0, y: 0, width: 60, height: 40 } } };
    await fireEvent(result.getByTestId('scope'), 'layout', event);
    expect(onLayout).toHaveBeenCalledWith(event);
  });

  it('preserves callback cleanup and inline same-host ref handoffs', async () => {
    const rootCleanup = jest.fn();
    const childCleanup = jest.fn();
    const rootRef = jest.fn((_instance: React.ComponentRef<typeof View> | null) => rootCleanup);
    const childRef = jest.fn((_instance: React.ComponentRef<typeof Pressable> | null) => childCleanup);
    const result = await render(
      <Toolbar accessibilityLabel="Commands" ref={rootRef}>
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={childRef} />
      </Toolbar>,
    );
    expect(childRef).toHaveBeenCalledTimes(1);
    await fireEvent(commands(result)[0], 'focus', { target: 1, currentTarget: 1 });
    await result.rerender(
      <Toolbar accessibilityLabel="Commands" ref={rootRef}>
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={childRef} />
      </Toolbar>,
    );
    expect(childCleanup).not.toHaveBeenCalled();
    await result.unmount();
    expect(rootCleanup).toHaveBeenCalledTimes(1);
    expect(childCleanup).toHaveBeenCalledTimes(1);
  });

  it('keeps an inline callback-ref handoff from duplicating held-key activation or release', async () => {
    const onPress = jest.fn();
    const onPressOut = jest.fn();
    const cleanup = jest.fn();
    const wrap = () => (
      <Toolbar accessibilityLabel="Handoff">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={() => cleanup} onPress={onPress} onPressOut={onPressOut} />
      </Toolbar>
    );
    const result = await render(wrap());
    await fireEvent(commands(result)[0], 'focus', { target: 1, currentTarget: 1 });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('Enter'));
    await result.rerender(wrap());
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('Enter'));
    await fireEvent(commands(result)[0], 'keyUp', keyEvent('Enter'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('retains root and child refs through compatible native-root replacements', async () => {
    const rootRef = React.createRef<React.ComponentRef<typeof View>>();
    const childRef = React.createRef<React.ComponentRef<typeof Pressable>>();
    const ViewHost = (props: PropsWithRefOf<typeof View>) => <View {...props} />;
    const CommandHost = (props: PropsWithRefOf<typeof Pressable>) => <Pressable {...props} />;
    const result = await render(
      <Toolbar accessibilityLabel="Replacement" as={ViewHost} ref={rootRef}>
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} as={CommandHost} ref={childRef} />
      </Toolbar>,
    );
    expect(rootRef.current).not.toBeNull();
    expect(childRef.current).not.toBeNull();
    await result.rerender(
      <Toolbar accessibilityLabel="Replacement" ref={rootRef}>
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} ref={childRef} />
      </Toolbar>,
    );
    expect(rootRef.current).not.toBeNull();
    expect(childRef.current).not.toBeNull();
    expect(stops(result)).toEqual([true]);
    await result.unmount();
    expect(rootRef.current).toBeNull();
    expect(childRef.current).toBeNull();
  });

  it('forwards native focus/blur once and does not treat a descendant event as command focus', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const result = await render(
      <Toolbar accessibilityLabel="Events">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} onFocus={onFocus} onBlur={onBlur} />
      </Toolbar>,
    );
    const focusEvent = { target: 2, currentTarget: 1 };
    const blurEvent = { target: 2, currentTarget: 1 };
    await fireEvent(commands(result)[0], 'focus', focusEvent);
    await fireEvent(commands(result)[0], 'blur', blurEvent);
    expect(onFocus).toHaveBeenCalledWith(focusEvent);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledWith(blurEvent);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('repairs the entry after removal/disable, retains it through reorder, and never restores native focus on cleanup', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const command = (value: string, disabled = false) => (
      <ToolbarButton
        key={value}
        value={value}
        accessibilityLabel={value}
        icon={icon}
        disabled={disabled}
        ref={value === 'one' ? ref : undefined}
      />
    );
    const wrap = (children: React.ReactNode) => <Toolbar accessibilityLabel="Dynamic">{children}</Toolbar>;
    const result = await render(wrap([command('one'), command('two')]));
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    await fireEvent(commands(result)[1], 'focus', { target: 2, currentTarget: 2 });
    const focus = jest
      .spyOn(ref.current!, 'focus')
      .mockImplementation(() => undefined)
      .mockClear();
    await result.rerender(wrap([command('two'), command('one')]));
    expect(stops(result)).toEqual([true, false]);
    await result.rerender(wrap([command('one')]));
    expect(stops(result)).toEqual([true]);
    expect(focus).not.toHaveBeenCalled();
    await result.rerender(wrap([command('one', true)]));
    expect(stops(result)).toEqual([false]);
    await result.rerender(wrap([command('one')]));
    expect(stops(result)).toEqual([true]);
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it.each([
    ['plain Button', <Button key="plain-button" content="Unregistered" />],
    ['editor', <Input key="editor" accessibilityLabel="Editor" />],
    [
      'wrapper',
      <View key="wrapper">
        <ToolbarButton value="inner" accessibilityLabel="Inner" icon={icon} />
      </View>,
    ],
    [
      'nested Toolbar',
      <Toolbar key="nested-toolbar" accessibilityLabel="Inner">
        <ToolbarButton value="inner" accessibilityLabel="Inner" icon={icon} />
      </Toolbar>,
    ],
    ['string', 'text'],
    ['unconfigured Divider', <Divider key="unconfigured-divider" />],
    ['labelled Divider', <Divider key="labelled-divider" vertical label="Group" />],
  ])('fails the entire scope closed for %s, without silently keeping valid actions', async (_label, invalid) => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await render(
      <Toolbar accessibilityLabel="Invalid">
        <ToolbarButton value="valid" accessibilityLabel="Valid" icon={icon} />
        {invalid}
      </Toolbar>,
    );
    expect(commands(result)).toHaveLength(0);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Toolbar rejected its command scope'));
    expect(result.getByRole('toolbar').props.focusable).toBe(false);
    error.mockRestore();
  });

  const invalidCommandCases: Record<string, unknown>[] = [
    { value: '' },
    { accessibilityLabel: '' },
    { icon: null },
    { value: 'one' },
    { content: 'Forbidden' },
    { focusable: true },
    { size: 'small' },
    { style: { display: 'none' } },
    { style: { flexDirection: 'column' } },
    { selected: 'yes' },
    { disabled: 'false' },
    { 'aria-checked': true },
    { accessibilityState: { checked: true } },
  ];
  it.each(invalidCommandCases)('diagnoses malformed/duplicate command props %j', async (invalid) => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await render(
      <Toolbar accessibilityLabel="Invalid">
        <ToolbarButton value="one" accessibilityLabel="One" icon={icon} />
        <ToolbarButton value="two" accessibilityLabel="Two" icon={icon} {...invalid} />
      </Toolbar>,
    );
    expect(commands(result)).toHaveLength(0);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  const invalidRootCases: Record<string, unknown>[] = [
    { orientation: 'vertical' },
    { wrap: false },
    { accessibilityLabel: '' },
    { style: { flexWrap: 'wrap' as const } },
    { style: { direction: 'rtl' as const } },
    { tabIndex: 0 },
    { size: 'medium' },
    { direction: 'up' },
    { importantForAccessibility: 'no-hide-descendants' },
  ];
  it.each(invalidRootCases)('rejects invalid root props %j without allowing an extra native root stop', async (invalid) => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await render(scene({ direction: 'ltr', ...invalid }));
    expect(commands(result)).toHaveLength(0);
    const root = result.getByRole('toolbar');
    expect(root.props.focusable).toBe(false);
    expect(root.props.tabIndex).toBeUndefined();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('diagnoses standalone ToolbarButton and empty scopes, and can recover from invalid composition', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await render(<ToolbarButton value="one" accessibilityLabel="One" icon={icon} />);
    expect(commands(result)).toHaveLength(0);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('a Toolbar parent is required'));
    await result.rerender(<Toolbar accessibilityLabel="Empty">{null}</Toolbar>);
    expect(warning).toHaveBeenCalledWith('Toolbar requires at least one ToolbarButton command.');
    await result.rerender(scene());
    expect(stops(result)).toEqual([true, false, false, false]);
    error.mockRestore();
    warning.mockRestore();
  });

  it('reports rejected controls in a production environment too', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const environment = jest.replaceProperty(process.env, 'NODE_ENV', 'production');
    try {
      const result = await render(
        <Toolbar accessibilityLabel="Invalid">
          <Button content="Unsupported" />
        </Toolbar>,
      );
      expect(commands(result)).toHaveLength(0);
      expect(error).toHaveBeenCalledWith(expect.stringContaining('Toolbar rejected its command scope'));
    } finally {
      environment.restore();
    }
  });

  it('reports an excluded mobile endpoint instead of silently presenting a desktop focus scope', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const platform = jest.replaceProperty(Platform, 'OS', 'android');
    try {
      const result = await render(scene());
      expect(commands(result)).toHaveLength(0);
      expect(error).toHaveBeenCalledWith(expect.stringContaining('outside the desktop Toolbar contract'));
    } finally {
      platform.restore();
    }
  });
});

describe('Toolbar targets', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  let context: ToolbarContextValue;
  const Host = (props: PropsWithRefOf<typeof Pressable>) => {
    context = React.useContext(ToolbarContext)!;
    return <Pressable {...props} />;
  };
  const targetScene = (ref?: React.Ref<React.ComponentRef<typeof Pressable>>) => (
    <Toolbar accessibilityLabel="Targets">
      <ToolbarButton value="one" accessibilityLabel="One" icon={icon} as={Host} />
      <ToolbarButton value="two" accessibilityLabel="Two" icon={icon} ref={ref} />
    </Toolbar>
  );

  it('commits eligibility before requesting and waits for native confirmation', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const result = await render(targetScene(ref));
    const focus = jest.spyOn(ref.current!, 'focus').mockImplementation(() => {
      expect(stops(result)).toEqual([false, true]);
    });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('ArrowRight'));
    expect(focus).toHaveBeenCalledTimes(1);
    expect(context.activeValue).toBe('two');
    await fireEvent(commands(result)[1], 'focus', { target: 2, currentTarget: 2 });
    expect(focus).toHaveBeenCalledTimes(1);
    focus.mockRestore();
  });

  function testTarget(status: 'requested' | 'unsupported' | 'not-mounted' = 'requested') {
    const cancel = jest.fn();
    const listeners = new Set<() => void>();
    const target: FocusTarget = {
      current: {},
      generation: 1,
      getSnapshot: () => ({ focused: false }),
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      requestFocus: jest.fn(() => ({ status, cancel })),
    };
    return { target, cancel, listeners };
  }

  it.each(['unsupported', 'not-mounted'] as const)(
    'warns and restores entry bookkeeping for %s without pretending success',
    async (status) => {
      const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const result = await render(targetScene());
      const { target } = testTarget(status);
      let cleanup: () => void;
      await act(() => {
        cleanup = context.register('two', target);
      });
      await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
      expect(warning).toHaveBeenCalledWith(`Toolbar cannot focus "two": ${status}.`);
      expect(stops(result)).toEqual([true, false]);
      await act(() => cleanup());
      warning.mockRestore();
    },
  );

  it('cancels pending focus on Tab exit and unsubscribe, and rejects stale registration cleanup', async () => {
    const result = await render(targetScene());
    const first = testTarget();
    const second = testTarget();
    let oldCleanup: () => void;
    let cleanup: () => void;
    await act(() => {
      oldCleanup = context.register('two', first.target);
      cleanup = context.register('two', second.target);
      oldCleanup();
    });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    expect(first.target.requestFocus).not.toHaveBeenCalled();
    expect(second.target.requestFocus).toHaveBeenCalledTimes(1);
    const tab = keyEvent('Tab');
    await fireEvent(commands(result)[1], 'keyDown', tab);
    expect(second.cancel).toHaveBeenCalledTimes(1);
    expect(tab.defaultPrevented).toBe(false);
    await act(() => cleanup());
    expect(second.listeners.size).toBe(0);
  });

  it('cancels an outstanding request when its destination generation changes', async () => {
    const result = await render(targetScene());
    const fake = testTarget();
    let cleanup: () => void;
    await act(() => {
      cleanup = context.register('two', fake.target);
    });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    await act(() => {
      Object.defineProperty(fake.target, 'generation', { value: 2 });
      fake.listeners.forEach((listener) => listener());
    });
    expect(fake.cancel).toHaveBeenCalledTimes(1);
    await act(() => cleanup());
  });

  it('cancels a pending request on destination blur and on scope unmount', async () => {
    const result = await render(targetScene());
    const fake = testTarget();
    await act(() => {
      context.register('two', fake.target);
    });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    await fireEvent(commands(result)[1], 'blur', { target: 2, currentTarget: 2 });
    expect(fake.cancel).toHaveBeenCalledTimes(1);
    await fireEvent(commands(result)[1], 'keyDown', keyEvent('Home'));
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    await result.unmount();
    expect(fake.cancel).toHaveBeenCalledTimes(2);
    expect(fake.listeners.size).toBe(0);
  });

  it('does not replay a requested focus when unrelated parent props rerender', async () => {
    const result = await render(targetScene());
    const fake = testTarget();
    let cleanup: () => void;
    await act(() => {
      cleanup = context.register('two', fake.target);
    });
    await fireEvent(commands(result)[0], 'keyDown', keyEvent('End'));
    await result.rerender(targetScene());
    expect(fake.target.requestFocus).toHaveBeenCalledTimes(1);
    expect(fake.cancel).not.toHaveBeenCalled();
    await act(() => cleanup());
    expect(fake.cancel).toHaveBeenCalledTimes(1);
  });
});

describe('Toolbar native key descriptors', () => {
  it.each(['windows', 'win32'])('uses the actual %s code/phase runtime shape without consuming modifiers or Tab', (platform) => {
    expect(getToolbarKeyProps(platform, true)).toEqual({
      keyDownEvents: ['ArrowLeft', 'ArrowRight', 'Home', 'End'].map((code) => ({
        code,
        handledEventPhase: 3,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      })),
    });
  });
  it('uses macOS key descriptors and never registers a competing compatibility filter', () => {
    expect(getToolbarKeyProps('macos', true)).toEqual({
      keyDownEvents: ['ArrowLeft', 'ArrowRight', 'Home', 'End'].map((key) => ({
        key,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      })),
    });
    expect(getToolbarKeyProps('macos', false)).toEqual({});
    expect(getToolbarKeyProps('android', true)).toEqual({});
  });
});
