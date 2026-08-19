/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';
import type { ViewProps } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { directComponent, isDirectComponent } from '@fluentui-react-native/framework-base';
import { useFlexTokens } from '@fluentui-react-native/design';

import { ListboxItem } from './listbox-item';

const ReplacementAvatar = directComponent<ViewProps>((props) => <View {...props} accessibilityHint="avatar" />);

function renderListboxItem(props: React.ComponentProps<typeof ListboxItem>): Promise<RenderResult> {
  return render(<ListboxItem {...props} />);
}

describe('ListboxItem', () => {
  it('toggles its own selection when multiselect is active', async () => {
    const onSelectedChange = jest.fn();
    const onPress = jest.fn();
    const component = await renderListboxItem({ content: 'Inbox', defaultSelected: false, multiselect: true, onPress, onSelectedChange });

    expect(component.queryByText('✓')).toBeNull();

    await fireEvent.press(component.getByRole('button'));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByText('✓')).toBeOnTheScreen();

    await fireEvent.press(component.getByRole('button'));

    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(component.queryByText('✓')).toBeNull();
  });

  it('only selects in single selection and reports presses when externally driven', async () => {
    const onSelectedChange = jest.fn();
    const single = await renderListboxItem({
      content: 'Inbox',
      defaultSelected: false,
      icon: { fontSource: { codepoint: 0x25cb, fontFamily: 'Arial' }, testID: 'regular-icon' },
      onSelectedChange,
      selectedIcon: { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, testID: 'filled-icon' },
    });

    await fireEvent.press(single.getByRole('button'));
    await fireEvent.press(single.getByRole('button'));

    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(single.getByTestId('filled-icon')).toBeOnTheScreen();

    const controlled = await renderListboxItem({ content: 'Inbox', multiselect: true, onSelectedChange, selected: false });

    await fireEvent.press(controlled.getByRole('button'));

    expect(onSelectedChange).toHaveBeenCalledTimes(2);
    expect(controlled.queryByText('✓')).toBeNull();
  });

  it('is directly renderable through the component boundary', () => {
    expect(isDirectComponent(ListboxItem)).toBe(false);
  });

  it('renders the default list item content, icon, and secondary text', async () => {
    const component = await renderListboxItem({ content: 'Choice' });

    expect(component.getByRole('button').props.accessibilityState).toMatchObject({ disabled: false });
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

    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(useFlexTokens().color.backgroundNeutralTransparent);
    expect(StyleSheet.flatten(component.getByText('Choice').props.style).fontWeight).toBe(useFlexTokens().fontWeight.functionalRegular);
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
  });

  it('renders hover, press, and focus feedback for list items', async () => {
    const component = await renderListboxItem({ content: 'Choice' });
    const root = component.getByRole('button');
    await fireEvent(root, 'hoverIn', {});
    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(useFlexTokens().color.hover.backgroundNeutralTransparent);

    await fireEvent(root, 'pressIn', {});
    expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(useFlexTokens().color.pressed.backgroundNeutralTransparent);

    await fireEvent(root, 'focus', {});
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({
      outlineColor: useFlexTokens().color.strokeFocusOuter,
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
