/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { MenuItem } from './menu-item';
import type { MenuItemProps } from './menu-item.types';
import { MenuItemMenuContext } from './menuItemContext';
import type { MenuItemMenuBinding, MenuItemMenuRow } from './menuItemContext';

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
      backgroundColor: defaultFlexTokens.color.backgroundNeutralTransparent.rest,
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
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralSoft.rest);
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
    expect(getRootStyle(component, 'menuitemradio').backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralTransparent.rest);
  });

  it('renders a multiselect checkbox and keeps the row background transparent', async () => {
    const component = await renderMenuItem({
      content: 'Multi select',
      hasMultiselect: true,
      selected: true,
    });

    expect(getRoot(component, 'menuitemcheckbox').props.accessibilityRole).toBe('menuitemcheckbox');
    expect(getRoot(component, 'menuitemcheckbox').props.accessibilityState).toMatchObject({ checked: true });
    expect(getRootStyle(component, 'menuitemcheckbox').backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralTransparent.rest);
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

  it('preserves disabled semantics and opt-in focusability through the macOS Pressable', async () => {
    const onPress = jest.fn();
    const component = await renderMenuItem({
      content: 'Unavailable',
      disabled: true,
      disabledFocusable: true,
      accessibilityState: { busy: true },
      onPress,
    });
    const root = getRoot(component);
    expect(root.props.focusable).toBe(true);
    expect(root.props.accessibilityState).toMatchObject({ disabled: true, busy: true });
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps disabled rows nonfocusable by default and never opts headers into focus', async () => {
    const disabled = await renderMenuItem({ content: 'Unavailable', disabled: true });
    expect(getRoot(disabled).props.focusable).toBe(false);
    const header = await renderMenuItem({ content: 'Group', menuStyle: 'section-header', disabledFocusable: true });
    expect(getRoot(header, 'none').props.focusable).toBe(false);
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

  it('uses native focus visuals for list items without mounting custom rings', async () => {
    const component = await renderMenuItem({ content: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
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

describe('MenuItem inside a Menu (MNI-007)', () => {
  function binding(overrides: Partial<MenuItemMenuBinding> = {}): MenuItemMenuBinding & { rows: MenuItemMenuRow[] } {
    const rows: MenuItemMenuRow[] = [];
    return {
      rows,
      disabledFocusable: true,
      register: jest.fn((row: MenuItemMenuRow) => {
        rows.push(row);
        return () => undefined;
      }),
      isSubmenuOpen: () => true,
      onRowPress: jest.fn(),
      onRowFocus: jest.fn(),
      onRowBlur: jest.fn(),
      onRowHoverIn: jest.fn(),
      onRowHoverOut: jest.fn(),
      onRowKeyDown: jest.fn(),
      SubmenuRow: (props: MenuItemProps) => <View testID={`submenu-row-${props.content}`} />,
      ...overrides,
    };
  }

  it('registers its label, inherits the disabled-focusable default, and reports input after caller handlers', async () => {
    const menu = binding();
    const calls: string[] = [];
    (menu.onRowPress as jest.Mock).mockImplementation(() => calls.push('menu'));
    const component = await render(
      <MenuItemMenuContext.Provider value={menu}>
        <MenuItem content="Paste" testID="paste" disabled />
        <MenuItem content="Copy" testID="copy" onPress={() => calls.push('caller')} />
      </MenuItemMenuContext.Provider>,
    );
    expect(menu.rows.map((row) => [row.text, row.focusable, row.hasSubmenu])).toEqual([
      ['Paste', true, false],
      ['Copy', true, false],
    ]);
    expect(component.getByTestId('paste').props.focusable).toBe(true);
    await fireEvent(component.getByTestId('copy'), 'press', { nativeEvent: { key: 'Enter' } });
    expect(calls).toEqual(['caller', 'menu']);
    expect(menu.onRowPress).toHaveBeenCalledWith(menu.rows[1].id, true);
    await fireEvent(component.getByTestId('paste'), 'press', { nativeEvent: {} });
    expect(menu.onRowPress).toHaveBeenCalledTimes(1);
  });

  it('hands a submenu row to the Menu', async () => {
    const component = await render(
      <MenuItemMenuContext.Provider value={binding()}>
        <MenuItem content="Share" submenu={{ children: null }} />
      </MenuItemMenuContext.Provider>,
    );
    expect(component.getByTestId('submenu-row-Share')).toBeOnTheScreen();
  });

  it('warns for a submenu outside a Menu and renders the chevron without a popup', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const component = await renderMenuItem({
        content: 'Share',
        submenu: { children: null },
        chevron: { testID: 'chevron' },
        testID: 'share',
      });
      expect(warn).toHaveBeenCalledWith('MenuItem: a submenu opens only from a list row inside a Menu.');
      expect(component.getByTestId('chevron')).toBeOnTheScreen();
      expect(component.getByTestId('share').props.accessibilityHint).toBe('Has submenu');
      expect(component.getByTestId('share').props.accessibilityState.expanded).toBeUndefined();
    } finally {
      warn.mockRestore();
    }
  });
});
