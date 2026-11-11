/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet, View } from 'react-native';

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
  it.each([false, true])('MNI-002 avatar wins over both icon paths when selected is %s', async (selected) => {
    const component = await renderMenuItem({
      content: 'Avatar command',
      selected,
      avatar: { as: View, testID: 'avatar' },
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular' },
      selectedIcon: { imageSource: { uri: 'selected.png' }, testID: 'selected' },
    });
    expect(component.getByTestId('avatar').props.accessible).toBe(false);
    expect(component.queryByTestId('regular')).toBeNull();
    expect(component.queryByTestId('selected')).toBeNull();
  });

  it('MNI-004 ignores loading on an interactive list row and never activates a loading header', async () => {
    const onPress = jest.fn();
    const component = await renderMenuItem({ content: 'Command', loading: true, onPress });
    expect(component.getByText('Command')).toBeOnTheScreen();
    await fireEvent.press(getRoot(component));
    expect(onPress).toHaveBeenCalledTimes(1);

    await component.rerender(<MenuItem content="Command" menuStyle="section-header" loading onPress={onPress} />);
    expect(component.queryByText('Command')).toBeNull();
    expect(getRoot(component, 'none').props.focusable).toBe(false);
    await fireEvent.press(getRoot(component, 'none'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

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

  it('MNI-007 reports focus, blur, hover, and keys after each original caller event', async () => {
    const calls: string[] = [];
    const menu = binding({
      onRowFocus: jest.fn(() => calls.push('menu-focus')),
      onRowBlur: jest.fn(() => calls.push('menu-blur')),
      onRowHoverIn: jest.fn(() => calls.push('menu-hoverIn')),
      onRowHoverOut: jest.fn(() => calls.push('menu-hoverOut')),
      onRowKeyDown: jest.fn(() => calls.push('menu-keyDown')),
    });
    const handlers = {
      onFocus: jest.fn(() => calls.push('caller-focus')),
      onBlur: jest.fn(() => calls.push('caller-blur')),
      onHoverIn: jest.fn(() => calls.push('caller-hoverIn')),
      onHoverOut: jest.fn(() => calls.push('caller-hoverOut')),
      onKeyDown: jest.fn(() => calls.push('caller-keyDown')),
    };
    const component = await render(
      <MenuItemMenuContext.Provider value={menu}>
        <MenuItem content="Command" {...handlers} />
      </MenuItemMenuContext.Provider>,
    );
    const event = { nativeEvent: { key: 'Home' } };
    for (const [name, handler] of [
      ['focus', handlers.onFocus],
      ['blur', handlers.onBlur],
      ['hoverIn', handlers.onHoverIn],
      ['hoverOut', handlers.onHoverOut],
      ['keyDown', handlers.onKeyDown],
    ] as const) {
      await fireEvent(getRoot(component), name, event);
      expect(handler.mock.calls).toEqual([[event]]);
    }
    expect(calls).toEqual([
      'caller-focus',
      'menu-focus',
      'caller-blur',
      'menu-blur',
      'caller-hoverIn',
      'menu-hoverIn',
      'caller-hoverOut',
      'menu-hoverOut',
      'caller-keyDown',
      'menu-keyDown',
    ]);
    expect(menu.onRowKeyDown).toHaveBeenCalledWith(menu.rows[0].id, event);
  });

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

describe('MenuItem native indicator semantics (MNI-003)', () => {
  it.each([
    ['win32', false, ['Select', 'Toggle']],
    ['win32', true, ['Toggle']],
    ['windows', false, ['select', 'toggle']],
    ['windows', true, ['toggle']],
    ['macos', false, ['Select', 'Toggle']],
    ['macos', true, ['Toggle']],
  ] as const)('declares native indicator actions on %s with multiselect %s', async (platform, hasMultiselect, actions) => {
    const replacement = jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    try {
      const component = await renderMenuItem({ hasCheckmark: !hasMultiselect, hasMultiselect });
      expect(getRoot(component, hasMultiselect ? 'menuitemcheckbox' : 'menuitemradio').props.accessibilityActions).toEqual(
        actions.map((name) => ({ name })),
      );
    } finally {
      replacement.restore();
    }
  });

  it('preserves caller labels and deduplicates both owned actions', async () => {
    const component = await renderMenuItem({
      hasCheckmark: true,
      accessibilityActions: [
        { name: 'Toggle', label: 'Toggle choice' },
        { name: 'Toggle' },
        { name: 'Select', label: 'Choose command' },
        { name: 'Select' },
        { name: 'custom' },
      ],
    });
    expect(getRoot(component, 'menuitemradio').props.accessibilityActions).toEqual([
      { name: 'Toggle', label: 'Toggle choice' },
      { name: 'Select', label: 'Choose command' },
      { name: 'custom' },
    ]);
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)('owns checked aliases with multiselect %s and selected %s', async (hasMultiselect, selected) => {
    const component = await renderMenuItem({
      hasCheckmark: !hasMultiselect,
      hasMultiselect,
      selected,
      accessibilityState: { busy: true, checked: !selected, selected: !selected },
      'aria-checked': !selected,
      'aria-selected': !selected,
    });
    expect(getRoot(component, hasMultiselect ? 'menuitemcheckbox' : 'menuitemradio').props.accessibilityState).toEqual({
      busy: true,
      checked: selected,
      selected: hasMultiselect ? !selected : selected,
      disabled: false,
    });
  });

  it('does not add owned actions to ordinary rows or section headers', async () => {
    const ordinary = await renderMenuItem({ accessibilityActions: [{ name: 'custom' }] });
    expect(getRoot(ordinary).props.accessibilityActions).toEqual([{ name: 'custom' }]);
    const header = await renderMenuItem({ menuStyle: 'section-header', hasCheckmark: true });
    expect(getRoot(header, 'none').props.accessibilityActions).toBeUndefined();
  });

  it.each([false, true])('preserves original custom events without pressing or selecting when disabled is %s', async (disabled) => {
    const onAccessibilityAction = jest.fn();
    const onPress = jest.fn();
    const component = await renderMenuItem({ hasMultiselect: true, selected: false, disabled, onAccessibilityAction, onPress });
    const event = { nativeEvent: { actionName: 'Toggle' } };
    const root = getRoot(component, 'menuitemcheckbox');
    root.props.onAccessibilityAction(event);
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    expect(onAccessibilityAction).toHaveBeenCalledWith(event);
    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.accessibilityState.checked).toBe(false);
  });
});
