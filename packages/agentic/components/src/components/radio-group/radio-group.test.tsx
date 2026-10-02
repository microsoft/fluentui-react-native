/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import type { FocusTarget } from '@fluentui-react-native/framework-base';

import { render } from '../../common/renderWithTheme';
import { Radio } from '../radio/radio';
import { RadioGroup } from './radio-group';
import { RadioGroupItem } from './radio-group-item';
import { RadioGroupContext } from './RadioGroupContext';
import * as itemStages from './useRadioGroupItem';
import type { RadioGroupContextValue } from './RadioGroupContext';
import type { RadioGroupProps } from './radio-group.types';

function items(tree: RenderResult) {
  return tree.getAllByRole('radio');
}
function checked(tree: RenderResult) {
  return items(tree).map((item) => item.props.accessibilityState.checked);
}
function tabbable(tree: RenderResult) {
  return items(tree).map((item) => item.props.focusable);
}
function optionsStyle(tree: RenderResult) {
  const options = tree.getByRole('radiogroup').children[1];
  if (typeof options !== 'object' || options === null) throw new Error('Expected the RadioGroup options host after its legend.');
  return StyleSheet.flatten(options.props.style);
}
function key(key: string, modifiers: Record<string, boolean> = {}) {
  return {
    nativeEvent: { key, code: key, ...modifiers },
    target: 1,
    currentTarget: 1,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation: jest.fn(),
  };
}
const pointer = { nativeEvent: {}, target: 2, currentTarget: 1 };

function scene(props: Partial<RadioGroupProps> = {}) {
  return (
    <RadioGroup label="Delivery" {...props}>
      <RadioGroupItem value="one" label="One" testID="one" />
      <RadioGroupItem value="disabled" label="Unavailable" disabled testID="disabled" />
      <RadioGroupItem value="two" label="Two" testID="two" />
    </RadioGroup>
  );
}

function nativeFocus(ref: React.RefObject<React.ComponentRef<typeof Pressable> | null>) {
  if (!ref.current) throw new Error('Expected a mounted Pressable ref.');
  return jest.spyOn(ref.current, 'focus').mockImplementation(() => undefined);
}

describe('RadioGroup', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('starts unanswered, composes a decorative Label and preserves native group/item intent', async () => {
    const tree = await render(scene({ required: true, accessibilityState: { busy: true } }));
    const root = tree.getByRole('radiogroup');
    expect(root.props).toMatchObject({ accessibilityLabel: 'Delivery', accessible: true, focusable: false, tabIndex: -1 });
    expect(root.props.accessibilityState).toEqual({ busy: true, disabled: false });
    expect(root.props.accessibilityState).not.toHaveProperty('required');
    expect(checked(tree)).toEqual([false, false, false]);
    expect(tabbable(tree)).toEqual([true, false, false]);
    expect(items(tree).map((item) => item.props.accessibilityPosInSet)).toEqual([1, 2, 3]);
    expect(items(tree).map((item) => item.props.accessibilitySetSize)).toEqual([3, 3, 3]);
    expect(items(tree).map((item) => item.props.accessibilityState.selected)).toEqual([false, false, false]);
    expect(tree.getByText('Delivery', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(tree.getByText('*', { includeHiddenElements: true }).props.accessible).toBe(false);
    expect(tree.queryAllByRole('text')).toHaveLength(0);
    expect(items(tree)[0].props.accessibilityLabel).toBe('One');
  });

  it.each([null, 'one', 'disabled', 'two'])('renders initial answer %s without callbacks', async (value) => {
    const change = jest.fn();
    const tree = await render(scene({ defaultSelectedValue: value, onSelectionChange: change }));
    expect(checked(tree)).toEqual(['one', 'disabled', 'two'].map((member) => member === value));
    expect(change).not.toHaveBeenCalled();
    expect(tabbable(tree)).toEqual(value === 'two' ? [false, false, true] : [true, false, false]);
  });

  it('does not select on native focus, descendant focus, or Tab entry and forwards focus/blur once', async () => {
    const change = jest.fn(),
      focus = jest.fn(),
      blur = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" onFocus={focus} onBlur={blur} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    await fireEvent(items(tree)[0], 'focus', { target: 2, currentTarget: 1 });
    await fireEvent(items(tree)[0], 'focus', { target: 1, currentTarget: 1 });
    await fireEvent(items(tree)[0], 'blur', { target: 1, currentTarget: 1 });
    expect(checked(tree)).toEqual([false, false]);
    expect(change).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalledTimes(2);
    expect(blur).toHaveBeenCalledTimes(1);
  });

  it('changes uncontrolled answer once, suppresses no-op selection and never turns a press into a toggle', async () => {
    const change = jest.fn(),
      press = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" onPress={press} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    await fireEvent.press(items(tree)[0], pointer);
    await fireEvent.press(items(tree)[0], pointer);
    expect(checked(tree)).toEqual([true, false]);
    expect(change.mock.calls).toEqual([['one']]);
    expect(press).toHaveBeenCalledTimes(2);
    await fireEvent.press(items(tree)[1], pointer);
    expect(checked(tree)).toEqual([false, true]);
    expect(change.mock.calls).toEqual([['one'], ['two']]);
  });

  it('keeps controlled null and refusals unchanged, accepts parent updates and external clear without callbacks', async () => {
    const change = jest.fn();
    const tree = await render(scene({ selectedValue: null, onSelectionChange: change }));
    await fireEvent.press(items(tree)[2], pointer);
    expect(checked(tree)).toEqual([false, false, false]);
    expect(change.mock.calls).toEqual([['two']]);
    await tree.rerender(scene({ selectedValue: 'two', onSelectionChange: change }));
    expect(checked(tree)).toEqual([false, false, true]);
    await tree.rerender(scene({ selectedValue: null, onSelectionChange: change }));
    expect(checked(tree)).toEqual([false, false, false]);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it.each(['vertical', 'horizontal'] as const)('handles both axes, Home/End and wrap in %s', async (orientation) => {
    const change = jest.fn(),
      press = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" orientation={orientation} onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" onPress={press} />
        <RadioGroupItem value="disabled" label="Unavailable" disabled />
        <RadioGroupItem value="two" label="Two" onPress={press} />
      </RadioGroup>,
    );
    for (const [index, name, expected] of [
      [0, 'ArrowRight', [false, false, true]],
      [2, 'ArrowDown', [true, false, false]],
      [0, 'ArrowUp', [false, false, true]],
      [2, 'ArrowLeft', [true, false, false]],
      [0, 'End', [false, false, true]],
      [2, 'Home', [true, false, false]],
    ] as const) {
      const event = key(name);
      await fireEvent(items(tree)[index], 'keyDown', event);
      expect(checked(tree)).toEqual(expected);
      expect(event.defaultPrevented).toBe(true);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    }
    expect(change).toHaveBeenCalledTimes(6);
    expect(press).not.toHaveBeenCalled();
  });

  it('reverses horizontal arrows for RTL but preserves vertical and logical Home/End', async () => {
    const tree = await render(scene({ direction: 'rtl', defaultSelectedValue: 'one' }));
    for (const [index, name, expected] of [
      [0, 'ArrowLeft', [false, false, true]],
      [2, 'Home', [true, false, false]],
      [0, 'ArrowDown', [false, false, true]],
      [2, 'End', [false, false, true]],
      [2, 'ArrowRight', [true, false, false]],
    ] as const) {
      await fireEvent(items(tree)[index], 'keyDown', key(name));
      expect(checked(tree)).toEqual(expected);
    }
  });

  it('forwards modifiers, cancelled events, non-self events and unsupported keys without navigation', async () => {
    const caller = jest.fn(),
      change = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" onKeyDown={caller} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    const events = [
      key('ArrowRight', { shiftKey: true }),
      key('ArrowRight', { ctrlKey: true }),
      key('ArrowRight', { metaKey: true }),
      key('ArrowRight', { altKey: true }),
      { ...key('ArrowRight'), defaultPrevented: true },
      { ...key('ArrowRight'), target: 2 },
      key('Escape'),
      key('Tab'),
      key('a'),
    ];
    for (const event of events) await fireEvent(items(tree)[0], 'keyDown', event);
    expect(change).not.toHaveBeenCalled();
    expect(caller).toHaveBeenCalledTimes(events.length);
    expect(events.every((event) => event.stopPropagation.mock.calls.length === 0)).toBe(true);
  });

  it('selects the sole eligible focused item without a redundant focus request', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const change = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" ref={ref} />
        <RadioGroupItem value="two" label="Two" disabled />
      </RadioGroup>,
    );
    const focus = nativeFocus(ref);
    await fireEvent(items(tree)[0], 'focus', { target: 1, currentTarget: 1 });
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowDown'));
    expect(checked(tree)).toEqual([true, false]);
    expect(change.mock.calls).toEqual([['one']]);
    expect(focus).not.toHaveBeenCalled();
  });

  it.each(['windows', 'win32', 'macos'])('keeps selection-before-focus and one pointer owner on %s', async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const change = jest.fn(),
      press = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" ref={ref} onPress={press} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    const focus = nativeFocus(ref).mockImplementation(() => {
      expect(checked(tree)).toEqual([true, false]);
      expect(tabbable(tree)).toEqual([true, false]);
      expect(change).toHaveBeenCalledTimes(1);
      expect(press).toHaveBeenCalledTimes(1);
    });
    await fireEvent.press(items(tree)[0], pointer);
    expect(change.mock.calls).toEqual([['one']]);
    expect(press).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(platform === 'macos' ? 0 : 1);
  });

  it('commits an initially non-entry Windows item before the sole focus request', async () => {
    jest.replaceProperty(Platform, 'OS', 'windows');
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const press = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" defaultSelectedValue="one">
        <RadioGroupItem value="one" label="One" />
        <RadioGroupItem value="two" label="Two" ref={ref} onPress={press} />
      </RadioGroup>,
    );
    const focus = nativeFocus(ref).mockImplementation(() => {
      expect(checked(tree)).toEqual([false, true]);
      expect(tabbable(tree)).toEqual([false, true]);
    });
    await fireEvent.press(items(tree)[1], pointer);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(press).toHaveBeenCalledTimes(1);
  });

  it('waits for controlled navigation acknowledgment and confirms only actual self-focus', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const change = jest.fn();
    let latest: RadioGroupContextValue | undefined;
    function Target(props: React.ComponentProps<typeof View>) {
      latest = React.useContext(RadioGroupContext);
      return <View {...props} />;
    }
    const children = (
      <>
        <RadioGroupItem value="one" label="One" />
        <RadioGroupItem value="two" label="Two" ref={ref} />
      </>
    );
    // The group root is rendered beneath its private provider without an extra target.
    const tree = await render(
      <RadioGroup label="Delivery" as={Target} selectedValue="one" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    const focus = nativeFocus(ref).mockImplementation(() => {
      expect(checked(tree)).toEqual([false, true]);
      expect(tabbable(tree)).toEqual([false, true]);
    });
    await fireEvent(items(tree)[0], 'focus', { target: 1, currentTarget: 1 });
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowDown'));
    expect(checked(tree)).toEqual([true, false]);
    expect(tabbable(tree)).toEqual([true, false]);
    expect(focus).not.toHaveBeenCalled();
    expect(change.mock.calls).toEqual([['two']]);
    await tree.rerender(
      <RadioGroup label="Delivery" as={Target} selectedValue="two" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    expect(focus).toHaveBeenCalledTimes(1);
    expect(latest?.activeValue).toBe('two');
    expect(latest?.focusedValue).toBe('one');
    await fireEvent(items(tree)[1], 'focus', { target: 1, currentTarget: 1 });
    expect(latest?.activeValue).toBe('two');
    expect(latest?.focusedValue).toBe('two');
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('cancels delayed controlled navigation on Tab, source exit, supersession and unrelated parent value', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const change = jest.fn();
    const children = [
      <RadioGroupItem key="one" value="one" label="One" />,
      <RadioGroupItem key="two" value="two" label="Two" ref={ref} />,
      <RadioGroupItem key="three" value="three" label="Three" />,
    ];
    const tree = await render(
      <RadioGroup label="Delivery" selectedValue="one" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    const focus = nativeFocus(ref);
    await fireEvent(items(tree)[0], 'focus', {});
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowDown'));
    await fireEvent(items(tree)[0], 'keyDown', key('Tab'));
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    expect(focus).not.toHaveBeenCalled();
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="one" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowDown'));
    await fireEvent(items(tree)[0], 'blur', {});
    await act(async () => undefined);
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    expect(focus).not.toHaveBeenCalled();
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="one" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowDown'));
    await fireEvent(items(tree)[0], 'keyDown', key('End'));
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two" onSelectionChange={change}>
        {children}
      </RadioGroup>,
    );
    expect(focus).not.toHaveBeenCalled();
  });

  it('retains focused entry during external updates and repairs reentry without moving focus', async () => {
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const children = [<RadioGroupItem key="one" value="one" label="One" />, <RadioGroupItem key="two" value="two" label="Two" ref={ref} />];
    const tree = await render(
      <RadioGroup label="Delivery" selectedValue="one">
        {children}
      </RadioGroup>,
    );
    const focus = nativeFocus(ref);
    await fireEvent(items(tree)[0], 'focus', {});
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two">
        {children}
      </RadioGroup>,
    );
    expect(checked(tree)).toEqual([false, true]);
    expect(tabbable(tree)).toEqual([true, false]);
    expect(focus).not.toHaveBeenCalled();
    await fireEvent(items(tree)[0], 'blur', {});
    expect(tabbable(tree)).toEqual([false, true]);
  });

  it('keeps a disabled answer, distributes disable, and removes every tab stop when all disabled', async () => {
    const change = jest.fn();
    const tree = await render(scene({ defaultSelectedValue: 'two', disabled: true, onSelectionChange: change }));
    expect(checked(tree)).toEqual([false, false, true]);
    expect(tabbable(tree)).toEqual([false, false, false]);
    expect(items(tree).every((item) => item.props.accessibilityState.disabled)).toBe(true);
    await fireEvent(items(tree)[2], 'accessibilityAction', { nativeEvent: { actionName: 'Select' } });
    await fireEvent(items(tree)[2], 'keyDown', key('ArrowUp'));
    expect(change).not.toHaveBeenCalled();
    await tree.rerender(scene({ defaultSelectedValue: null, onSelectionChange: change }));
    expect(checked(tree)).toEqual([false, false, true]);
    expect(tabbable(tree)).toEqual([false, false, true]);
  });

  it('preserves selection through reorder and clears an uncontrolled removed answer only once', async () => {
    const change = jest.fn();
    const renderItems = (values: string[]) => (
      <RadioGroup label="Delivery" defaultSelectedValue="two" onSelectionChange={change}>
        {values.map((value) => (
          <RadioGroupItem key={value} value={value} label={value} />
        ))}
      </RadioGroup>
    );
    const tree = await render(renderItems(['one', 'two', 'three']));
    await tree.rerender(renderItems(['three', 'two', 'one']));
    expect(items(tree).map((item) => [item.props.accessibilityLabel, item.props.accessibilityState.checked])).toEqual([
      ['three', false],
      ['two', true],
      ['one', false],
    ]);
    await tree.rerender(renderItems(['three', 'one']));
    await waitFor(() => expect(change.mock.calls).toEqual([[null]]));
    expect(checked(tree)).toEqual([false, false]);
    expect(tabbable(tree)).toEqual([true, false]);
    await tree.rerender(renderItems(['one', 'three']));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('diagnoses a removed controlled answer without replacing it or selecting a peer', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const change = jest.fn();
    const tree = await render(scene({ selectedValue: 'two', onSelectionChange: change }));
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" />
        <RadioGroupItem value="three" label="Three" />
      </RadioGroup>,
    );
    expect(checked(tree)).toEqual([false, false]);
    expect(tabbable(tree)).toEqual([true, false]);
    expect(change).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('RadioGroup: selected value "two" is no longer a member.');
  });

  it.each(['windows', 'win32', 'macos'])('resolves %s Select, preserves custom events, and never synthesizes presses', async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const change = jest.fn(),
      action = jest.fn(),
      press = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem
          value="one"
          label="One"
          onPress={press}
          onAccessibilityAction={action}
          accessibilityActions={[{ name: 'Select', label: 'Choose' }, { name: 'select' }, { name: 'details' }]}
        />
        <RadioGroupItem value="two" label="Two" disabled onAccessibilityAction={action} />
      </RadioGroup>,
    );
    const name = platform === 'windows' ? 'select' : 'Select';
    expect(items(tree)[0].props.accessibilityActions).toEqual([{ name, label: 'Choose' }, { name: 'details' }]);
    const event = { nativeEvent: { actionName: name } };
    await fireEvent(items(tree)[0], 'accessibilityAction', event);
    await fireEvent(items(tree)[0], 'accessibilityAction', event);
    await fireEvent(items(tree)[0], 'accessibilityAction', { nativeEvent: { actionName: 'details' } });
    await act(() => items(tree)[1].props.onAccessibilityAction(event));
    expect(checked(tree)).toEqual([true, false]);
    expect(change.mock.calls).toEqual([['one']]);
    expect(action).toHaveBeenCalledTimes(4);
    expect(action).toHaveBeenNthCalledWith(1, event);
    expect(press).not.toHaveBeenCalled();
  });

  it('preserves the shared Win32 unidentified-code keyup fallback and release bookkeeping', async () => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    const change = jest.fn(),
      press = jest.fn(),
      up = jest.fn(),
      down = jest.fn(),
      release = jest.fn();
    const tree = await render(
      <RadioGroup label="Delivery" onSelectionChange={change}>
        <RadioGroupItem value="one" label="One" onPress={press} onKeyDown={down} onKeyUp={up} onPressOut={release} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    const enter = { ...key('Enter'), nativeEvent: { key: 'Enter', code: 'Unidentified' } };
    await fireEvent(items(tree)[0], 'keyDown', enter);
    expect(change).not.toHaveBeenCalled();
    await fireEvent(items(tree)[0], 'keyUp', { ...enter, defaultPrevented: false });
    expect(change.mock.calls).toEqual([['one']]);
    expect(press).toHaveBeenCalledTimes(1);
    expect(down).toHaveBeenCalledTimes(1);
    expect(up).toHaveBeenCalledTimes(1);
    await fireEvent(items(tree)[0], 'keyUp', { ...enter, defaultPrevented: false });
    expect(press).toHaveBeenCalledTimes(1);
  });

  it('composes root/item refs, callback cleanup and replacement without redirecting roots', async () => {
    const root = React.createRef<React.ComponentRef<typeof View>>();
    const item = React.createRef<React.ComponentRef<typeof Pressable>>();
    const cleanup = jest.fn();
    const callback = jest.fn(() => cleanup);
    const element = (ref: RadioGroupProps['ref']) => (
      <RadioGroup label="Delivery" ref={ref}>
        <RadioGroupItem value="one" label="One" ref={item} />
        <RadioGroupItem value="two" label="Two" ref={callback} />
      </RadioGroup>
    );
    const tree = await render(element(root));
    expect(root.current).not.toBeNull();
    expect(item.current).not.toBeNull();
    expect(root.current).not.toBe(item.current);
    const host = item.current;
    await tree.rerender(element(root));
    expect(item.current).toBe(host);
    expect(callback).toHaveBeenCalledTimes(1);
    await tree.unmount();
    expect(root.current).toBeNull();
    expect(item.current).toBeNull();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('does not let an older registration cleanup remove a newer registration for the same target', async () => {
    let context: RadioGroupContextValue | undefined;
    let target: FocusTarget | undefined;
    const original = itemStages.useRadioGroupItem_unstable;
    jest.spyOn(itemStages, 'useRadioGroupItem_unstable').mockImplementation((props) => {
      const state = original(props);
      if (props.value === 'two') target = state.focusTarget;
      return state;
    });
    function Root(props: React.ComponentProps<typeof View>) {
      context = React.useContext(RadioGroupContext);
      return <View {...props} />;
    }
    const ref = React.createRef<React.ComponentRef<typeof Pressable>>();
    const tree = await render(
      <RadioGroup label="Delivery" as={Root}>
        <RadioGroupItem value="one" label="One" />
        <RadioGroupItem value="two" label="Two" ref={ref} />
      </RadioGroup>,
    );
    if (!context || !target) throw new Error('Expected the group and Radio pipeline target.');
    const older = context.registerItem('two', target);
    const newer = context.registerItem('two', target);
    older();
    const focus = nativeFocus(ref);
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowRight'));
    expect(focus).toHaveBeenCalledTimes(1);
    await act(async () => newer());
  });

  it('cancels pending work on item removal, disable, replacement and unmount without restoration', async () => {
    const first = React.createRef<React.ComponentRef<typeof Pressable>>();
    const second = React.createRef<React.ComponentRef<typeof Pressable>>();
    const tree = await render(
      <RadioGroup label="Delivery" selectedValue="one">
        <RadioGroupItem value="one" label="One" ref={first} />
        <RadioGroupItem value="two" label="Two" ref={second} />
        <RadioGroupItem value="three" label="Three" />
      </RadioGroup>,
    );
    const focusOne = nativeFocus(first),
      focusTwo = nativeFocus(second);
    await fireEvent(items(tree)[0], 'focus', {});
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowRight'));
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="one">
        <RadioGroupItem value="one" label="One" ref={first} />
        <RadioGroupItem value="two" label="Two" ref={second} disabled />
        <RadioGroupItem value="three" label="Three" />
      </RadioGroup>,
    );
    await tree.rerender(
      <RadioGroup label="Delivery" selectedValue="two">
        <RadioGroupItem value="one" label="One" ref={first} />
        <RadioGroupItem value="two" label="Two" ref={second} disabled />
        <RadioGroupItem value="three" label="Three" />
      </RadioGroup>,
    );
    expect(focusOne).not.toHaveBeenCalled();
    expect(focusTwo).not.toHaveBeenCalled();
    expect(checked(tree)).toEqual([false, true, false]);
    expect(tabbable(tree)).toEqual([true, false, false]);
    await tree.unmount();
    expect(second.current).toBeNull();
  });

  it('diagnoses a missing native target instead of declaring focus confirmed', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const replacement: React.ComponentType<React.ComponentPropsWithRef<typeof Pressable>> = ({ ref: _ref, ...props }) => (
      <Pressable {...props} />
    );
    const tree = await render(
      <RadioGroup label="Delivery">
        <RadioGroupItem value="one" label="One" />
        <RadioGroupItem value="two" label="Two" as={replacement} />
      </RadioGroup>,
    );
    await fireEvent(items(tree)[0], 'keyDown', key('ArrowRight'));
    expect(warning).toHaveBeenCalledWith('RadioGroup cannot focus "two": not-mounted.');
  });

  it('retains Radio visuals/hidden descendants, finite layout axes, tokens and caller-last styles', async () => {
    const tree = await render(
      <RadioGroup label="Delivery" orientation="horizontal" direction="rtl" style={{ gap: 77 }} required disabled>
        <RadioGroupItem value="one" label="Long option text" secondaryText="Details" showSecondaryText style={{ width: 120 }} />
        <RadioGroupItem value="two" label="Two" />
      </RadioGroup>,
    );
    expect(StyleSheet.flatten(tree.getByRole('radiogroup').props.style)).toMatchObject({
      flexDirection: 'column',
      gap: 77,
      direction: 'rtl',
    });
    expect(optionsStyle(tree)).toMatchObject({
      flexDirection: 'row',
      direction: 'rtl',
      gap: defaultFlexTokens.spacing.componentBase100,
    });
    expect(StyleSheet.flatten(items(tree)[0].props.style)).toMatchObject({ width: 120 });
    expect(tree.getByText('Long option text', { includeHiddenElements: true }).parent?.props.accessibilityElementsHidden).toBe(true);
    expect(tree.getByText('Details', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(items(tree)[0].props.accessibilityHint).toBe('Details');
    expect(items(tree)[0].props.keyDownEvents).toEqual([]);
  });

  it('supports flat Fragment/array/conditional membership without wrapper introspection', async () => {
    const tree = await render(
      <RadioGroup label="Delivery">
        {false}
        {null}
        <>
          <RadioGroupItem value="one" label="One" />
          <>
            <RadioGroupItem value="two" label="Two" />
          </>
        </>
      </RadioGroup>,
    );
    expect(items(tree)).toHaveLength(2);
  });

  it('preserves explicit names, unrelated state and only the exact unmodified navigation descriptors', async () => {
    const tree = await render(
      <RadioGroup label="Visible question" accessibilityLabel="Accessible question" nativeID="question" testID="question">
        <RadioGroupItem value="one" label="Visible first" accessibilityLabel="Accessible first" accessibilityState={{ busy: true }} />
        <RadioGroupItem value="two" label="Second" />
      </RadioGroup>,
    );
    expect(tree.getByRole('radiogroup').props).toMatchObject({ nativeID: 'question', accessibilityLabel: 'Accessible question' });
    expect(items(tree)[0].props.accessibilityLabel).toBe('Accessible first');
    expect(items(tree)[0].props.accessibilityState).toEqual({ busy: true, selected: false, checked: false, disabled: false });
    expect(items(tree)[0].props.keyDownEvents).toEqual(
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].map((name) => ({
        key: name,
        code: name,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        eventPhase: 3,
        handledEventPhase: 3,
      })),
    );
  });

  it.each([
    ['vertical', 'ltr'],
    ['vertical', 'rtl'],
    ['horizontal', 'ltr'],
    ['horizontal', 'rtl'],
  ] as const)('binds the %s/%s layout to exact group spacing without a surface or fixed height', async (orientation, direction) => {
    const tree = await render(scene({ orientation, direction }));
    const rootStyle = StyleSheet.flatten(tree.getByRole('radiogroup').props.style);
    expect(rootStyle).toMatchObject({ flexDirection: 'column', gap: defaultFlexTokens.spacing.componentBase300, direction });
    expect(rootStyle).not.toHaveProperty('height');
    expect(rootStyle).not.toHaveProperty('backgroundColor');
    expect(rootStyle).not.toHaveProperty('borderWidth');
    expect(optionsStyle(tree)).toMatchObject({
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      gap: defaultFlexTokens.spacing.componentBase100,
      direction,
      minWidth: 0,
    });
  });

  it.each([
    ['one member', <RadioGroupItem key="one" value="one" label="One" />],
    [
      'duplicate',
      <>
        <RadioGroupItem value="same" label="One" />
        <RadioGroupItem value="same" label="Two" />
      </>,
    ],
    [
      'plain Radio',
      <>
        <Radio label="One" />
        <RadioGroupItem value="two" label="Two" />
      </>,
    ],
    [
      'opaque wrapper',
      <>
        <View>
          <RadioGroupItem value="one" label="One" />
        </View>
        <RadioGroupItem value="two" label="Two" />
      </>,
    ],
    [
      'blank value',
      <>
        <RadioGroupItem value=" " label="One" />
        <RadioGroupItem value="two" label="Two" />
      </>,
    ],
    [
      'blank name',
      <>
        <RadioGroupItem value="one" label=" " />
        <RadioGroupItem value="two" label="Two" />
      </>,
    ],
    [
      'six members',
      ['one', 'two', 'three', 'four', 'five', 'six'].map((value) => <RadioGroupItem key={value} value={value} label={value} />),
    ],
  ])('throws a descriptive all-build error for %s', async (_reason, children) => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<RadioGroup label="Delivery">{children}</RadioGroup>)).rejects.toThrow(/RadioGroup:/);
  });

  it('rejects orphan items, blank group names, missing initial values and mode switches', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<RadioGroupItem value="one" label="One" />)).rejects.toThrow(/direct RadioGroup parent/);
    await expect(render(scene({ label: ' ' }))).rejects.toThrow(/label must be/);
    await expect(render(scene({ accessibilityLabel: ' ' }))).rejects.toThrow(/accessibilityLabel must be/);
    await expect(render(scene({ defaultSelectedValue: 'absent' }))).rejects.toThrow(/initial selected value/);
    const tree = await render(scene({ selectedValue: null }));
    await expect(tree.rerender(scene())).rejects.toThrow(/cannot switch/);
  });
});
