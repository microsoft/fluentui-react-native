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
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: useFlexTokens().color.strokeFocusOuter,
      borderWidth: useFlexTokens().strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: useFlexTokens().color.strokeFocusInner,
      borderWidth: useFlexTokens().strokeWidth.thin,
    });
    expect(StyleSheet.flatten(root.props.style)).not.toMatchObject({
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
