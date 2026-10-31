/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { View } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { ListboxItem } from '../listbox-item/listbox-item';
import { Dropdown } from './dropdown';
import * as popupHostModule from '../../common/popupHost';
import { collectDropdownOptions, getDisplayedOptions } from './dropdownOptions';
import { dropdownListMaxHeight } from './dropdownPopup';
import type { DropdownProps } from './dropdown.types';

type ReactTestInstance = ReturnType<typeof screen.getByTestId>;

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));

const { dispatchCommand } = jest.requireMock('react-native/Libraries/ReactNative/RendererProxy') as { dispatchCommand: jest.Mock };

function focusStrategies(): string[] {
  return dispatchCommand.mock.calls.filter(([, name]) => name === 'requestFocus').map(([, , args]) => args[args.length - 1]);
}

function hostOf(testId: string, prop: string): ReactTestInstance {
  let node: ReactTestInstance | null = screen.getByTestId(testId);
  while (node && node.props[prop] === undefined) node = node.parent;
  if (!node) throw new Error(`Missing native host with ${prop}`);
  return node;
}

async function ready() {
  const host = hostOf('listbox', 'anchorMode');
  await fireEvent(host, 'ready', { nativeEvent: { generation: host.props.commandGeneration } });
  return host;
}

async function dismiss(reason: string) {
  const host = hostOf('listbox', 'anchorMode');
  await fireEvent(host, 'closed', { nativeEvent: { generation: host.props.commandGeneration, reason } });
}

const keyboardPress = { nativeEvent: { key: 'Enter' } };
const pointerPress = { nativeEvent: {} };

function action(actionName: string) {
  return { nativeEvent: { actionName } };
}

function Scene(props: Partial<DropdownProps>) {
  return (
    <Dropdown accessibilityLabel="Fruit" testID="trigger" listbox={{ testID: 'listbox' }} {...props}>
      <ListboxItem variant="sectionHeader" content="Fruit" />
      <ListboxItem value="apple" content="Apple" testID="apple" />
      <ListboxItem value="banana" content="Banana" testID="banana" disabled />
      <>
        <ListboxItem value="cherry" content={{ children: 'Cherry' }} testID="cherry" />
      </>
      <ListboxItem value="date" accessibilityLabel="Date" testID="date" />
    </Dropdown>
  );
}

describe('Dropdown', () => {
  beforeEach(() => dispatchCommand.mockClear());

  it.each(
    (['controlled', 'uncontrolled'] as const).flatMap((owner) =>
      [
        { scenario: 'select replaces', actionName: 'Select', initial: ['apple'], target: 'cherry', next: ['cherry'], changed: true },
        { scenario: 'select unchanged', actionName: 'Select', initial: ['apple'], target: 'apple', next: ['apple'], changed: false },
        {
          scenario: 'add appends',
          actionName: 'AddToSelection',
          initial: ['apple'],
          target: 'cherry',
          next: ['apple', 'cherry'],
          changed: true,
        },
        {
          scenario: 'add existing',
          actionName: 'AddToSelection',
          initial: ['apple', 'cherry'],
          target: 'apple',
          next: ['apple', 'cherry'],
          changed: false,
        },
        { scenario: 'remove selected', actionName: 'RemoveFromSelection', initial: ['apple'], target: 'apple', next: [], changed: true },
        {
          scenario: 'remove absent',
          actionName: 'RemoveFromSelection',
          initial: ['apple'],
          target: 'cherry',
          next: ['apple'],
          changed: false,
        },
        { scenario: 'custom forwarded', actionName: 'custom', initial: ['apple'], target: 'cherry', next: ['apple'], changed: false },
      ].map((scenario) => ({ owner, ...scenario })),
    ),
  )('DRP-005 DRP-011 handles $scenario once with $owner multiselection', async ({ owner, actionName, initial, target, next, changed }) => {
    const calls: string[] = [];
    const onSelectedOptionsChange = jest.fn(() => calls.push('selection'));
    const onAccessibilityAction = jest.fn(() => calls.push('action'));
    const onOpenChange = jest.fn();
    const onPress = jest.fn();
    const scene = (selection: string[]) => (
      <Dropdown
        accessibilityLabel="Fruit"
        defaultOpen
        multiselect
        selectedOptions={owner === 'controlled' ? selection : undefined}
        defaultSelectedOptions={initial}
        onSelectedOptionsChange={onSelectedOptionsChange}
        onOpenChange={onOpenChange}
      >
        {['apple', 'cherry'].map((value) => (
          <ListboxItem
            key={value}
            value={value}
            content={value === 'apple' ? 'Apple' : 'Cherry'}
            accessibilityActions={[{ name: 'custom', label: 'Custom action' }]}
            onAccessibilityAction={onAccessibilityAction}
            onPress={onPress}
          />
        ))}
      </Dropdown>
    );
    const component = await render(scene(initial));
    const event = action(actionName);
    await fireEvent(component.getByRole('listitem', { name: target === 'apple' ? 'Apple' : 'Cherry' }), 'accessibilityAction', event);

    expect(onSelectedOptionsChange.mock.calls).toEqual(changed ? [[next, { value: target }]] : []);
    expect(onAccessibilityAction.mock.calls).toEqual([[event]]);
    expect(calls).toEqual(changed ? ['selection', 'action'] : ['action']);
    expect(onPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(component.getByRole('combobox', { name: 'Fruit' }).props.accessibilityState.expanded).toBe(true);
    const displayed = owner === 'controlled' ? initial : next;
    expect(component.getAllByRole('listitem').map((option) => option.props.accessibilityState.selected)).toEqual([
      displayed.includes('apple'),
      displayed.includes('cherry'),
    ]);

    await component.rerender(scene(next));
    const trigger = component.getByRole('combobox', { name: 'Fruit' });
    expect(trigger.props.accessibilityValue).toEqual({
      text: ['apple', 'cherry']
        .filter((value) => next.includes(value))
        .map((value) => (value === 'apple' ? 'Apple' : 'Cherry'))
        .join(', '),
    });
    expect(component.getAllByRole('listitem').map((option) => option.props.accessibilityState.selected)).toEqual([
      next.includes('apple'),
      next.includes('cherry'),
    ]);
    expect(onSelectedOptionsChange).toHaveBeenCalledTimes(changed ? 1 : 0);
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('renders an inaccessible root around a collapsed combobox trigger showing the placeholder', async () => {
    const ref = React.createRef<View>();
    await render(<Scene ref={ref} />);
    const trigger = screen.getByTestId('trigger');
    expect(trigger.props.accessibilityRole).toBe('combobox');
    expect(trigger.props.accessibilityLabel).toBe('Fruit');
    expect(trigger.props.accessibilityState).toMatchObject({ expanded: false, disabled: false });
    expect(trigger.props.accessibilityValue).toEqual({ text: '' });
    expect(screen.getByText('Select an option', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId('listbox')).toBeNull();
    expect(ref.current).not.toBeNull();
  });

  it('lifts root props to the trigger, letting trigger values win and merging accessibility state', async () => {
    const onFocus = jest.fn();
    await render(
      <Scene
        accessibilityHint="Root hint"
        accessibilityState={{ busy: true }}
        onFocus={onFocus}
        trigger={{ accessibilityHint: 'Trigger hint', accessibilityState: { checked: true } }}
      />,
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger.props.accessibilityHint).toBe('Trigger hint');
    expect(trigger.props.accessibilityState).toMatchObject({ busy: true, checked: true, expanded: false });
    await fireEvent(trigger, 'focus', { nativeEvent: { target: 1 } });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('warns in development when the trigger has no name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await render(
        <Dropdown>
          <ListboxItem value="apple" content="Apple" />
        </Dropdown>,
      );
      expect(warn.mock.calls.some(([message]) => String(message).includes('Dropdown'))).toBe(true);
    } finally {
      warn.mockRestore();
    }
  });

  it('opens from the keyboard with a named list surface and focuses the first enabled option', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
    const listbox = screen.getByTestId('listbox');
    expect(listbox.props.role).toBe('list');
    expect(listbox.props.accessibilityLabel).toBe('Fruit');
    expect(listbox.props.accessibilityState).toMatchObject({ multiselectable: false, required: false });
    expect(listbox.props.focusable).toBe(false);
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: true });
    const host = hostOf('listbox', 'anchorMode');
    expect(host.props.tabNavigation).toBe('continue');
    await ready();
    expect(focusStrategies()).toEqual(['target']);
  });

  it('requests a vertical scroller only while the options overflow the viewport, and never a horizontal one', async () => {
    await render(<Scene defaultOpen />);
    const scroll = () => hostOf('apple', 'onContentSizeChange');
    const layout = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: 200, height } } });
    expect(scroll().props.showsHorizontalScrollIndicator).toBe(false);
    expect(scroll().props.showsVerticalScrollIndicator).toBe(false);
    await act(async () => {
      scroll().props.onLayout(layout(240));
      scroll().props.onContentSizeChange(200, 400);
    });
    expect(scroll().props.showsVerticalScrollIndicator).toBe(true);
    await act(async () => scroll().props.onContentSizeChange(200, 240));
    expect(scroll().props.showsVerticalScrollIndicator).toBe(false);
    // The viewport, not the list's height cap, decides overflow: 245pt of options overflow a 240pt viewport.
    expect(dropdownListMaxHeight).toBeGreaterThan(245);
    await act(async () => scroll().props.onContentSizeChange(200, 245));
    expect(scroll().props.showsVerticalScrollIndicator).toBe(true);
    await act(async () => scroll().props.onLayout(layout(250)));
    expect(scroll().props.showsVerticalScrollIndicator).toBe(false);
    expect(scroll().props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('opens from Down and Up and from the expand action', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowUp' } });
    expect(onOpenChange).toHaveBeenLastCalledWith(true, { reason: 'trigger' });
    await dismiss('escape');
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowDown', altKey: true } });
    expect(screen.queryByTestId('listbox')).toBeNull();
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    expect(screen.getByTestId('listbox')).toBeTruthy();
  });

  it('exposes bound options with list-item semantics, positions, and selection actions', async () => {
    await render(<Scene defaultOpen defaultSelectedOptions={['cherry']} />);
    const cherry = screen.getByTestId('cherry');
    expect(cherry.props.accessibilityRole).toBe('listitem');
    expect(cherry.props.accessibilityLabel).toBe('Cherry');
    expect(cherry.props.accessibilityState).toMatchObject({ selected: true, disabled: false });
    expect(cherry.props.accessibilityPosInSet).toBe(3);
    expect(cherry.props.accessibilitySetSize).toBe(4);
    expect(cherry.props.accessibilityActions.map(({ name }: { name: string }) => name)).toEqual(
      expect.arrayContaining(['Select', 'AddToSelection', 'RemoveFromSelection']),
    );
    expect(screen.getByTestId('date').props.accessibilityLabel).toBe('Date');
    expect(screen.getByTestId('banana').props.accessibilityState).toMatchObject({ disabled: true, selected: false });
  });

  it('commits a single-mode option, closes with select, and shows its label', async () => {
    const onSelectedOptionsChange = jest.fn();
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} onSelectedOptionsChange={onSelectedOptionsChange} />);
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    await fireEvent(screen.getByTestId('cherry'), 'press', keyboardPress);
    expect(onSelectedOptionsChange).toHaveBeenCalledWith(['cherry'], { value: 'cherry' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'select' });
    expect(screen.queryByTestId('listbox')).toBeNull();
    expect(screen.getByText('Cherry', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('trigger').props.accessibilityValue).toEqual({ text: 'Cherry' });

    // Committing the selected option closes the list without reporting a change.
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    await fireEvent(screen.getByTestId('cherry'), 'press', keyboardPress);
    expect(onSelectedOptionsChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('listbox')).toBeNull();
  });

  it('refuses disabled options and the actions of a disabled option', async () => {
    const onSelectedOptionsChange = jest.fn();
    await render(<Scene defaultOpen onSelectedOptionsChange={onSelectedOptionsChange} />);
    await fireEvent(screen.getByTestId('banana'), 'press', keyboardPress);
    await fireEvent(screen.getByTestId('banana'), 'accessibilityAction', action('Select'));
    expect(onSelectedOptionsChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('listbox')).toBeTruthy();
  });

  it('displays only the selection a controlled caller supplies', async () => {
    const onSelectedOptionsChange = jest.fn();
    await render(<Scene defaultOpen selectedOptions={['apple']} onSelectedOptionsChange={onSelectedOptionsChange} />);
    await fireEvent(screen.getByTestId('cherry'), 'press', keyboardPress);
    expect(onSelectedOptionsChange).toHaveBeenCalledWith(['cherry'], { value: 'cherry' });
    expect(screen.getByTestId('trigger').props.accessibilityValue).toEqual({ text: 'Apple' });
  });

  it('applies single-mode selection actions: select commits, add commits only an empty selection, remove is refused', async () => {
    const onSelectedOptionsChange = jest.fn();
    const onAccessibilityAction = jest.fn();
    const { rerender } = await render(
      <Dropdown accessibilityLabel="Fruit" listbox={{ testID: 'listbox' }} defaultOpen onSelectedOptionsChange={onSelectedOptionsChange}>
        <ListboxItem value="apple" content="Apple" testID="apple" onAccessibilityAction={onAccessibilityAction} />
        <ListboxItem value="cherry" content="Cherry" testID="cherry" />
      </Dropdown>,
    );
    await fireEvent(screen.getByTestId('apple'), 'accessibilityAction', action('RemoveFromSelection'));
    expect(onSelectedOptionsChange).not.toHaveBeenCalled();
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    await fireEvent(screen.getByTestId('apple'), 'accessibilityAction', action('AddToSelection'));
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['apple'], { value: 'apple' });
    expect(onAccessibilityAction).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('listbox')).toBeNull();

    await rerender(
      <Dropdown
        accessibilityLabel="Fruit"
        listbox={{ testID: 'listbox' }}
        open
        selectedOptions={['apple']}
        onSelectedOptionsChange={onSelectedOptionsChange}
      >
        <ListboxItem value="apple" content="Apple" testID="apple" />
        <ListboxItem value="cherry" content="Cherry" testID="cherry" />
      </Dropdown>,
    );
    await fireEvent(screen.getByTestId('cherry'), 'accessibilityAction', action('AddToSelection'));
    expect(onSelectedOptionsChange).toHaveBeenCalledTimes(1);
    await fireEvent(screen.getByTestId('cherry'), 'accessibilityAction', action('Select'));
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['cherry'], { value: 'cherry' });
  });

  it('toggles options in multiple mode, keeps the list open, and joins labels in option order', async () => {
    const onSelectedOptionsChange = jest.fn();
    await render(<Scene multiselect defaultOpen onSelectedOptionsChange={onSelectedOptionsChange} />);
    expect(screen.getByTestId('listbox').props.accessibilityState).toMatchObject({ multiselectable: true });
    await fireEvent(screen.getByTestId('date'), 'press', keyboardPress);
    await fireEvent(screen.getByTestId('apple'), 'press', pointerPress);
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['date', 'apple'], { value: 'apple' });
    expect(screen.getByTestId('listbox')).toBeTruthy();
    expect(screen.getByTestId('trigger').props.accessibilityValue).toEqual({ text: 'Apple, Date' });
    await fireEvent(screen.getByTestId('date'), 'press', keyboardPress);
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['apple'], { value: 'date' });
  });

  it('applies multiple-mode selection actions: select replaces, add adds, remove removes', async () => {
    const onSelectedOptionsChange = jest.fn();
    await render(<Scene multiselect defaultOpen defaultSelectedOptions={['apple']} onSelectedOptionsChange={onSelectedOptionsChange} />);
    await fireEvent(screen.getByTestId('cherry'), 'accessibilityAction', action('AddToSelection'));
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['apple', 'cherry'], { value: 'cherry' });
    await fireEvent(screen.getByTestId('apple'), 'accessibilityAction', action('RemoveFromSelection'));
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['cherry'], { value: 'apple' });
    await fireEvent(screen.getByTestId('date'), 'accessibilityAction', action('Select'));
    expect(onSelectedOptionsChange).toHaveBeenLastCalledWith(['date'], { value: 'date' });
    expect(screen.getByTestId('listbox')).toBeTruthy();
  });

  it('shows the count summary in multiple mode when the labels do not fit', async () => {
    await render(<Scene multiselect defaultSelectedOptions={['apple', 'cherry']} formatSelectedCount={(count) => `${count} fruits`} />);
    const measure = screen.getAllByText('Apple, Cherry', { includeHiddenElements: true });
    expect(measure).toHaveLength(2);
    const layoutOf = (node: ReactTestInstance) => {
      let current: ReactTestInstance | null = node;
      while (current && typeof current.props.onLayout !== 'function') current = current.parent;
      if (!current) throw new Error('Missing layout handler');
      return current.props.onLayout as (event: object) => void;
    };
    await act(async () => {
      layoutOf(measure[0])({ nativeEvent: { layout: { width: 50 } } });
      layoutOf(measure[1])({ nativeEvent: { layout: { width: 120 } } });
    });
    expect(screen.getByText('2 fruits', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('trigger').props.accessibilityValue).toEqual({ text: 'Apple, Cherry' });
  });

  it('floors the list content at the trigger width inside the surface padding and border', async () => {
    await render(<Scene open listbox={{ testID: 'listbox', style: { padding: 10, borderWidth: 2 } }} />);
    await act(async () => {
      screen.getByTestId('trigger').props.onLayout({ nativeEvent: { layout: { width: 240 } } });
    });
    const [floor] = screen.getByTestId('listbox').children as ReactTestInstance[];
    expect(floor.props.pointerEvents).toBe('none');
    expect(StyleSheet.flatten(floor.props.style)).toEqual({ height: 0, width: 216 });
  });

  it('latches a controlled list closed after native dismissal until the trigger rearms it', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene open onOpenChange={onOpenChange} />);
    await dismiss('escape');
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(screen.queryByTestId('listbox')).toBeNull();
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: false });
    await fireEvent(screen.getByTestId('trigger'), 'press', keyboardPress);
    expect(screen.getByTestId('listbox')).toBeTruthy();
  });

  it('closes on a trigger press that began while open without reopening', async () => {
    const onOpenChange = jest.fn();
    await render(<Scene onOpenChange={onOpenChange} />);
    const trigger = screen.getByTestId('trigger');
    await fireEvent(trigger, 'press', keyboardPress);
    await fireEvent(trigger, 'pressIn', pointerPress);
    await fireEvent(trigger, 'press', pointerPress);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'trigger' });
    expect(screen.queryByTestId('listbox')).toBeNull();
  });

  it('never presents while disabled and closes when disabled while open', async () => {
    const onOpenChange = jest.fn();
    const { rerender } = await render(<Scene defaultOpen onOpenChange={onOpenChange} />);
    expect(screen.getByTestId('listbox')).toBeTruthy();
    await rerender(<Scene defaultOpen disabled onOpenChange={onOpenChange} />);
    expect(screen.queryByTestId('listbox')).toBeNull();
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ disabled: true, expanded: false });
    await fireEvent(screen.getByTestId('trigger'), 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    await rerender(<Scene defaultOpen onOpenChange={onOpenChange} />);
    expect(screen.queryByTestId('listbox')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('makes the surface focusable when no option is enabled', async () => {
    await render(
      <Dropdown accessibilityLabel="Fruit" listbox={{ testID: 'listbox' }} defaultOpen>
        <ListboxItem value="apple" content="Apple" disabled />
      </Dropdown>,
    );
    expect(screen.getByTestId('listbox').props.focusable).toBe(true);
  });

  it('warns in development for options without values, repeated values, and several single-mode selections', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await render(
        <Dropdown accessibilityLabel="Fruit" defaultSelectedOptions={['apple', 'cherry']}>
          <ListboxItem content="Loose" />
          <ListboxItem value="apple" content="Apple" />
          <ListboxItem value="apple" content="Apple again" />
          <ListboxItem value="cherry" content="Cherry" />
        </Dropdown>,
      );
      const messages = warn.mock.calls.map(([message]) => String(message));
      expect(messages).toEqual(
        expect.arrayContaining([
          'Dropdown: a ListboxItem without a string value is not an option.',
          'Dropdown: the option value "apple" repeats; the first option with it wins.',
          'Dropdown: more than one value is selected in single mode; only the first selected value that matches an option counts.',
        ]),
      );
      expect(screen.getByText('Apple', { includeHiddenElements: true })).toBeTruthy();
    } finally {
      warn.mockRestore();
    }
  });

  it('throws a descriptive error on hosts without a popup route', async () => {
    const replaced = jest.replaceProperty(popupHostModule, 'popupHost', undefined);
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      await expect(render(<Scene />)).rejects.toThrow("Dropdown requires native-core's Callout and FocusZone");
    } finally {
      error.mockRestore();
      replaced.restore();
    }
  });
});

describe('dropdown options', () => {
  it('discovers options through Fragments with labels from content, content children, label, or value', () => {
    const options = collectDropdownOptions(
      <>
        <ListboxItem value="a" content="Alpha" />
        <>
          <ListboxItem value="b" content={{ children: 'Bravo' }} />
          <ListboxItem value="c" accessibilityLabel="Charlie" />
        </>
        <ListboxItem value="d" />
      </>,
    );
    expect(options.list.map(({ value, label, position }) => [value, label, position])).toEqual([
      ['a', 'Alpha', 1],
      ['b', 'Bravo', 2],
      ['c', 'Charlie', 3],
      ['d', 'd', 4],
    ]);
  });

  it('displays the first matching value in single mode and matches in option order in multiple mode', () => {
    const options = collectDropdownOptions([<ListboxItem key="a" value="a" />, <ListboxItem key="b" value="b" />]);
    expect(getDisplayedOptions(options, ['x', 'b', 'a'], false).map(({ value }) => value)).toEqual(['b']);
    expect(getDisplayedOptions(options, ['x', 'b', 'a'], true).map(({ value }) => value)).toEqual(['a', 'b']);
  });
});
