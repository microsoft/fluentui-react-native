/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { directComponent, isDirectComponent } from '@fluentui-react-native/framework-base';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { ListboxItem } from './listbox-item';
import type { ListboxItemOptionBinding, ListboxItemOptionRegistration } from './listboxItemOptionContext';
import { ListboxItemOptionContext } from './listboxItemOptionContext';

const ReplacementAvatar = directComponent<ViewProps>((props) => <View {...props} accessibilityHint="avatar" />);

function renderListboxItem(props: React.ComponentProps<typeof ListboxItem>): Promise<RenderResult> {
  return render(<ListboxItem {...props} />);
}

describe('ListboxItem', () => {
  it.each([
    { selected: false, disabled: false },
    { selected: true, disabled: false },
    { selected: false, disabled: true },
    { selected: true, disabled: true },
  ])('LBI-003 LBI-005 projects owner-selected=$selected with disabled=$disabled', async ({ selected, disabled }) => {
    const onPress = jest.fn();
    const component = await renderListboxItem({ content: 'Choice', selected, disabled, onPress });
    const root = component.getByRole('button');

    expect(root.props.accessibilityState).toMatchObject({ checked: selected, disabled });
    expect(root.props.focusable).toBe(!disabled);
    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(disabled ? 0 : 1);
    expect(root.props.accessibilityState.checked).toBe(selected);

    await component.rerender(<ListboxItem content="Choice" selected={!selected} disabled={disabled} onPress={onPress} />);
    expect(component.getByRole('button').props.accessibilityState).toMatchObject({ checked: !selected, disabled });
    expect(onPress).toHaveBeenCalledTimes(disabled ? 0 : 1);
  });

  it('LBI-005 owns checked, disabled and role over caller state and ARIA aliases without losing busy', async () => {
    const component = await renderListboxItem({
      content: 'Choice',
      selected: false,
      accessibilityState: { busy: true, checked: true, disabled: true },
      'aria-checked': true,
      'aria-disabled': true,
      role: 'checkbox',
    });

    expect(component.getByRole('button').props.accessibilityState).toMatchObject({ busy: true, checked: false, disabled: false });
  });

  it('LBI-005 declares the native toggle action and forwards the original owner event without synthesizing a press', async () => {
    const onAccessibilityAction = jest.fn();
    const onPress = jest.fn();
    const component = await renderListboxItem({
      content: 'Choice',
      selected: true,
      accessibilityActions: [{ name: 'Toggle', label: 'Update selection' }, { name: 'inspect' }],
      onAccessibilityAction,
      onPress,
    });
    const root = component.getByRole('button');
    expect(root.props.accessibilityActions).toEqual([{ name: 'Toggle', label: 'Update selection' }, { name: 'inspect' }]);
    const event = { nativeEvent: { actionName: 'Toggle' } };
    await fireEvent(root, 'accessibilityAction', event);
    expect(onAccessibilityAction.mock.calls).toEqual([[event]]);
    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.accessibilityState.checked).toBe(true);
  });

  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderListboxItem({ content: 'Inbox', multiselect: true, onPress, selected: false });

    expect(component.queryByText('✓')).toBeNull();

    await fireEvent.press(component.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.queryByText('✓')).toBeNull();
  });

  it('is directly renderable through the component boundary', () => {
    expect(isDirectComponent(ListboxItem)).toBe(false);
  });

  it('renders the default list item content, icon, and secondary text', async () => {
    const component = await renderListboxItem({ content: 'Choice' });

    expect(component.getByRole('button').props.accessibilityState).toMatchObject({ disabled: false });
    expect(component.getByRole('button').props.accessibilityActions).toContainEqual({ name: 'Toggle' });
    expect(component.getByText('Choice')).toBeOnTheScreen();
    expect(component.getByText('Secondary')).toBeOnTheScreen();
    expect(component.getByText('○')).toBeOnTheScreen();
  });

  it('applies selected visual state, swaps the icon, and preserves the label width', async () => {
    const component = await renderListboxItem({
      content: 'Choice',
      icon: { fontSource: { codepoint: 0x25cb, fontFamily: 'Arial' }, testID: 'regular-icon' },
      selected: true,
      selectedIcon: { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, testID: 'filled-icon' },
    });

    expect(component.getByRole('button').props.accessibilityState).toMatchObject({ disabled: false });
    expect(component.getByTestId('filled-icon')).toBeOnTheScreen();
    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(component.getAllByText('Choice', { includeHiddenElements: true })).toHaveLength(2);
  });

  it('suppresses selected styling for multiselect rows and shows a checkbox visual', async () => {
    const component = await renderListboxItem({ content: 'Choice', multiselect: true, selected: true });
    const root = component.getByRole('button');

    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralTransparent);
    expect(StyleSheet.flatten(component.getByText('Choice').props.style).fontWeight).toBe(defaultFlexTokens.fontWeight.functionalRegular);
    expect(component.getByText('✓')).toBeOnTheScreen();
  });

  it('renders secondary content under the label when requested', async () => {
    const component = await renderListboxItem({
      content: 'Choice',
      secondaryContent: 'notes@example.com',
      secondaryContentPosition: 'under',
    });

    expect(component.getByText('notes@example.com')).toBeOnTheScreen();
    expect(StyleSheet.flatten(component.getByText('notes@example.com').props.style)).toMatchObject({ flexShrink: 1 });
  });

  it('renders a section header and loading skeleton state', async () => {
    const component = await renderListboxItem({ content: 'Group', loading: true, variant: 'sectionHeader' });

    expect(component.getByRole('header')).toBeOnTheScreen();
    expect(component.queryByText('Group')).toBeNull();
    expect(component.queryByRole('button')).toBeNull();
    expect(component.getByRole('header').props.focusable).toBe(false);
    expect(component.getByRole('header').props.accessibilityState?.checked).toBeUndefined();
  });

  it('renders hover, press, and focus feedback for list items', async () => {
    const component = await renderListboxItem({ content: 'Choice' });
    const root = component.getByRole('button');
    await fireEvent(root, 'hoverIn', {});
    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(defaultFlexTokens.color.hover.backgroundNeutralTransparent);

    await fireEvent(root, 'pressIn', {});
    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(defaultFlexTokens.color.pressed.backgroundNeutralTransparent);

    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
    expect(StyleSheet.flatten(root.props.style)).not.toMatchObject({
      outlineColor: defaultFlexTokens.color.strokeFocusOuter,
      outlineStyle: 'solid',
    });
  });

  it('supports avatar and icon slot replacement', async () => {
    const component = await renderListboxItem({
      avatar: { as: ReplacementAvatar },
      content: 'Choice',
      icon: { as: ReplacementAvatar },
    });

    expect(component.getByAccessibilityHint('avatar')).toBeOnTheScreen();
  });
});

describe('ListboxItem bound to a list (LBI-006)', () => {
  function createBinding(overrides: Partial<ListboxItemOptionBinding> = {}) {
    const calls: string[] = [];
    const registrations: ListboxItemOptionRegistration[] = [];
    const binding: ListboxItemOptionBinding = {
      multiselect: false,
      setSize: 3,
      isSelected: (value) => value === 'b',
      getPosition: (value) => ({ a: 1, b: 2, c: 3 })[value],
      useNativeTarget: () => ({ target: 'native', ref: () => undefined }),
      register: (option) => {
        registrations.push(option);
        return () => undefined;
      },
      onOptionFocus: (value) => calls.push(`focus:${value}`),
      onOptionBlur: (value) => calls.push(`blur:${value}`),
      onOptionHoverIn: (value) => calls.push(`hover:${value}`),
      onOptionKeyDown: (value, event) => calls.push(`key:${value}:${event.nativeEvent.key}`),
      onOptionPress: (value) => calls.push(`press:${value}`),
      onOptionAction: (value, action) => calls.push(`action:${value}:${action}`),
      ...overrides,
    };
    return { binding, calls, registrations };
  }

  function renderBound(binding: ListboxItemOptionBinding, props: React.ComponentProps<typeof ListboxItem>) {
    return render(
      <ListboxItemOptionContext.Provider value={binding}>
        <ListboxItem {...props} />
      </ListboxItemOptionContext.Provider>,
    );
  }

  it('exposes a list item with list-owned selection, position, and selection actions', async () => {
    const { binding, registrations } = createBinding();
    const component = await renderBound(binding, {
      value: 'b',
      content: 'Bravo',
      selected: false,
      checkmark: false,
      testID: 'b',
      accessibilityState: { busy: true, selected: false, disabled: true },
      'aria-selected': false,
      'aria-disabled': true,
      role: 'button',
    });
    const option = component.getByTestId('b');
    expect(option.props.accessibilityRole).toBe('listitem');
    expect(component.getByRole('listitem')).toBe(option);
    expect(option.props.accessibilityState).toMatchObject({ busy: true, selected: true, disabled: false });
    expect(option.props.accessibilityState.checked).toBeUndefined();
    expect(option.props.accessibilityState.pressed).toBeUndefined();
    expect(option.props.accessibilityLabel).toBe('Bravo');
    expect(option.props.accessibilityPosInSet).toBe(2);
    expect(option.props.accessibilitySetSize).toBe(3);
    expect(option.props.accessibilityActions.map(({ name }: { name: string }) => name)).toEqual(
      expect.arrayContaining(['Select', 'AddToSelection', 'RemoveFromSelection']),
    );
    expect(option.props.keyDownEvents).toEqual(expect.arrayContaining([{ key: 'Home' }, { key: 'End' }]));
    expect(component.getByText('✓', { includeHiddenElements: true })).toBeTruthy();
    expect(registrations).toHaveLength(1);
    expect(registrations[0]).toMatchObject({ value: 'b', disabled: false, nativeTarget: 'native' });
  });

  it('shows the label or value without default decorations', async () => {
    const { binding } = createBinding();
    const component = await renderBound(binding, { value: 'c', accessibilityLabel: 'Charlie', testID: 'c' });
    expect(component.getAllByText('Charlie', { includeHiddenElements: true }).length).toBeGreaterThan(0);
    expect(component.queryByTestId('listbox-item-default-icon')).toBeNull();
    expect(component.queryByText('Secondary', { includeHiddenElements: true })).toBeNull();
  });

  it('applies list actions before the caller handler, which runs once, and reports input after caller handlers', async () => {
    const { binding, calls } = createBinding();
    const onAccessibilityAction = jest.fn(() => calls.push('caller:action'));
    const onPress = jest.fn(() => calls.push('caller:press'));
    const component = await renderBound(binding, { value: 'a', content: 'Alpha', testID: 'a', onAccessibilityAction, onPress });
    const option = component.getByTestId('a');
    await fireEvent(option, 'accessibilityAction', { nativeEvent: { actionName: 'AddToSelection' } });
    await fireEvent(option, 'accessibilityAction', { nativeEvent: { actionName: 'Select' } });
    await fireEvent(option, 'keyDown', { nativeEvent: { key: 'End' } });
    await fireEvent(option, 'hoverIn', {});
    await fireEvent(option, 'press', { nativeEvent: {} });
    expect(onAccessibilityAction).toHaveBeenCalledTimes(2);
    expect(calls).toEqual([
      'action:a:add',
      'caller:action',
      'action:a:select',
      'caller:action',
      'key:a:End',
      'hover:a',
      'caller:press',
      'press:a',
    ]);
  });

  it('refuses actions while disabled', async () => {
    const { binding, calls } = createBinding();
    const component = await renderBound(binding, { value: 'a', content: 'Alpha', testID: 'a', disabled: true });
    await fireEvent(component.getByTestId('a'), 'accessibilityAction', { nativeEvent: { actionName: 'Select' } });
    expect(calls).toEqual([]);
    expect(component.getByTestId('a').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('shows the checkbox indicator in multiple mode', async () => {
    const { binding } = createBinding({ multiselect: true });
    const component = await renderBound(binding, { value: 'b', content: 'Bravo', testID: 'b' });
    expect(component.getByText('✓', { includeHiddenElements: true }).props.style).toMatchObject({ position: 'absolute' });
    expect(component.getByTestId('b').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('stays a standalone item without a value', async () => {
    const { binding, registrations } = createBinding();
    const component = await renderBound(binding, { content: 'Loose', testID: 'loose' });
    expect(component.getByTestId('loose').props.accessibilityRole).toBe('button');
    expect(registrations).toHaveLength(0);
  });
});
