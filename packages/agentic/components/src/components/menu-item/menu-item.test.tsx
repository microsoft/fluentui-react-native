/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { MenuItem } from './menu-item';
import type { MenuItemProps } from './menu-item.types';

function renderMenuItem(props: MenuItemProps): Promise<RenderResult> {
  return render(<MenuItem {...props} />);
}

function getRoot(component: RenderResult, role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'none' = 'menuitem') {
  return component.getByRole(role);
}

function getRootStyle(component: RenderResult, role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' = 'menuitem') {
  return StyleSheet.flatten(getRoot(component, role).props.style);
}

describe('MenuItem', () => {
  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderMenuItem({ content: 'Inbox', hasMultiselect: true, onPress, selected: false });

    await fireEvent.press(getRoot(component, 'menuitemcheckbox'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component, 'menuitemcheckbox').props.accessibilityState.checked).toBe(false);
  });

  it('renders a default interactive row with icon and secondary content', async () => {
    const component = await renderMenuItem({ content: 'Save' });

    expect(getRoot(component).props.accessibilityRole).toBe('menuitem');
    expect(component.getAllByText('Save', { includeHiddenElements: true })).toHaveLength(2);
    expect(component.getAllByText('Secondary', { includeHiddenElements: true })).toHaveLength(2);
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: '#00000000',
      minHeight: 40,
    });
  });

  it('uses the selected icon, selected background, and semibold text when selected', async () => {
    const component = await renderMenuItem({
      content: 'Favorite',
      icon: { fontSource: { codepoint: 0x25cb, fontFamily: 'Arial' }, testID: 'regular-icon' },
      selected: true,
      selectedIcon: { fontSource: { codepoint: 0x25cf, fontFamily: 'Arial' }, testID: 'selected-icon' },
    });

    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(component.getByTestId('selected-icon')).toBeOnTheScreen();
    expect(getRootStyle(component).backgroundColor).toBe('#0000001a');
    expect(
      component
        .getAllByText('Favorite', { includeHiddenElements: true })
        .map((text) => StyleSheet.flatten(text.props.style).fontWeight)
        .includes('600'),
    ).toBe(true);
  });

  it('renders a right-aligned checkmark row without selected styling', async () => {
    const component = await renderMenuItem({ hasCheckmark: true, content: 'Single select', selected: false });

    expect(getRoot(component, 'menuitemradio').props.accessibilityRole).toBe('menuitemradio');
    expect(getRoot(component, 'menuitemradio').props.accessibilityState).toMatchObject({ checked: false });
    expect(getRootStyle(component, 'menuitemradio').backgroundColor).toBe('#00000000');
  });

  it('renders a multiselect checkbox and keeps the row background transparent', async () => {
    const component = await renderMenuItem({
      content: 'Multi select',
      hasMultiselect: true,
      selected: true,
    });

    expect(getRoot(component, 'menuitemcheckbox').props.accessibilityRole).toBe('menuitemcheckbox');
    expect(getRoot(component, 'menuitemcheckbox').props.accessibilityState).toMatchObject({ checked: true });
    expect(getRootStyle(component, 'menuitemcheckbox').backgroundColor).toBe('#00000000');
  });

  it('supports section headers, loading skeletons, and no focusability', async () => {
    const component = await renderMenuItem({
      content: 'Group',
      loading: true,
      menuStyle: 'section-header',
    });

    expect(getRoot(component, 'none').props.accessibilityRole).toBe('none');
    expect(getRoot(component, 'none').props.focusable).toBe(false);
    expect(component.queryByText('Group')).toBeNull();
  });

  it('forwards user styles last and preserves handlers', async () => {
    const onPress = jest.fn();
    const component = await renderMenuItem({
      content: 'Press me',
      onPress,
      style: { backgroundColor: 'hotpink' },
    });
    const root = getRoot(component);

    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('renders a persistent dual-ring focus visual for list items', async () => {
    const component = await renderMenuItem({ content: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusOuter,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
  });

  it('hides secondary content when null and keeps the default when omitted', async () => {
    const omitted = await renderMenuItem({ content: 'With secondary' });
    const hidden = await renderMenuItem({ content: 'No secondary', secondaryContent: null });

    expect(omitted.getAllByText('Secondary', { includeHiddenElements: true })).toHaveLength(2);
    expect(hidden.queryByText('Secondary')).toBeNull();
  });

  it('renders custom leading and trailing slots in a stable order', async () => {
    const component = await renderMenuItem({
      avatar: { as: View, testID: 'avatar' },
      chevron: { fontSource: { codepoint: 0x203a, fontFamily: 'Arial' }, testID: 'chevron' },
      content: 'Ordered',
      icon: { fontSource: { codepoint: 0x25cb, fontFamily: 'Arial' }, testID: 'icon' },
      hasChevron: true,
      hasMultiselect: true,
      selected: true,
    });

    expect(component.getByTestId('avatar')).toBeOnTheScreen();
    expect(component.getByTestId('chevron')).toBeOnTheScreen();
  });
});
