/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ImageStyle, PressableProps, TextStyle, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Button } from '../button/button';

import { NavItem } from './nav-item';
import type { NavItemProps } from './nav-item.types';

function renderNavItem(props: NavItemProps): Promise<RenderResult> {
  return render(<NavItem {...props} />);
}

function getRoot(component: RenderResult, role: 'link' | 'button' = 'link') {
  return component.getAllByRole(role)[0];
}

function getRootStyle(component: RenderResult, role: 'link' | 'button' = 'link'): ViewStyle {
  return StyleSheet.flatten(getRoot(component, role).props.style);
}

function getIndicatorStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('nav-item-selected-indicator', { includeHiddenElements: true }).props.style);
}

const colors = defaultFlexTokens.color;

describe('NavItem', () => {
  it('renders the default destination row with link semantics and a stable label', async () => {
    const component = await renderNavItem({});
    const root = getRoot(component);

    expect(root.props.role).toBe('link');
    expect(root.props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(root.props.accessible).toBe(true);
    expect(root.props.focusable).toBe(true);
    expect(component.getAllByText('Nav item', { includeHiddenElements: true })).toHaveLength(2);
    expect(component.queryByTestId('nav-item-chevron')).toBeNull();
    expect(getIndicatorStyle(component).backgroundColor).toBe(colors.strokeNeutralTransparent);
  });

  it('forwards the root ref to the pressable root', async () => {
    const ref = { current: null } as React.RefObject<unknown>;
    await renderNavItem({ label: 'Inbox', ref: ref as never });

    expect(ref.current).not.toBeNull();
  });

  it('prefers the avatar over both icons and the selected icon over the resting icon', async () => {
    const withIcons = await renderNavItem({
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      label: 'Favorites',
      selected: true,
      selectedIcon: { imageSource: { uri: 'filled.png' }, testID: 'filled-icon' },
    });

    expect(withIcons.getByTestId('filled-icon').props.source).toEqual({ uri: 'filled.png' });
    expect(withIcons.queryByTestId('regular-icon')).toBeNull();

    const withAvatar = await renderNavItem({
      avatar: { initials: 'CS', testID: 'avatar' },
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      label: 'Cameron',
    });

    expect(withAvatar.getByTestId('avatar', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(withAvatar.queryByTestId('regular-icon')).toBeNull();
  });

  it('renders only the supplied trailing content and actions', async () => {
    const bare = await renderNavItem({ label: 'Inbox' });
    expect(bare.queryByTestId('trailing-actions')).toBeNull();
    expect(bare.queryByText('12')).toBeNull();

    const populated = await renderNavItem({
      label: 'Inbox',
      trailingActions: { children: <Button content="More" />, testID: 'trailing-actions' },
      trailingContent: '12',
    });

    expect(populated.getByTestId('trailing-actions')).toBeOnTheScreen();
    expect(populated.getByText('12')).toBeOnTheScreen();
  });

  it('applies the selected treatment while leaving selection caller owned', async () => {
    const onPress = jest.fn();
    const component = await renderNavItem({
      icon: { imageSource: { uri: 'filled.png' }, testID: 'icon' },
      label: 'Inbox',
      onPress,
      selected: true,
    });
    const root = getRoot(component);
    const labels = component.getAllByText('Inbox', { includeHiddenElements: true });

    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralSoft);
    expect(getIndicatorStyle(component).backgroundColor).toBe(colors.strokeBrandLoud);
    expect(StyleSheet.flatten(labels[1].props.style as TextStyle).fontWeight).toBe(defaultFlexTokens.fontWeight.functionalSemibold);
    expect(StyleSheet.flatten(component.getByTestId('icon').props.style as ImageStyle).tintColor).toBe(colors.foregroundBrandPrimary);

    await fireEvent.press(root);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState.selected).toBe(true);
  });

  it('reserves the selected label width so selection never reflows the row', async () => {
    const component = await renderNavItem({ label: 'Inbox' });
    const labels = component.getAllByText('Inbox', { includeHiddenElements: true });

    expect(StyleSheet.flatten(labels[0].props.style as TextStyle)).toMatchObject({
      fontWeight: defaultFlexTokens.fontWeight.functionalSemibold,
      opacity: 0,
    });
    expect(StyleSheet.flatten(labels[1].props.style as TextStyle).fontWeight).toBe(defaultFlexTokens.fontWeight.functionalRegular);
  });

  it('renders a category row as a disclosure button with caller owned expansion', async () => {
    const onPress = jest.fn();
    const collapsed = await renderNavItem({ controls: 'mail-group', label: 'Mail', onPress, type: 'category' });
    const root = getRoot(collapsed, 'button');

    expect(root.props.role).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false, expanded: false });
    expect(root.props.accessibilityState.selected).toBeUndefined();
    expect(root.props.accessibilityControls).toBe('mail-group');
    expect(StyleSheet.flatten(collapsed.getByTestId('nav-item-chevron').props.style as ViewStyle).transform).toEqual([{ rotate: '90deg' }]);

    await fireEvent.press(root);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(collapsed, 'button').props.accessibilityState.expanded).toBe(false);

    const expanded = await renderNavItem({ expanded: true, label: 'Mail', type: 'category' });
    expect(getRoot(expanded, 'button').props.accessibilityState).toEqual({ disabled: false, expanded: true });
    expect(StyleSheet.flatten(expanded.getByTestId('nav-item-chevron').props.style as ViewStyle).transform).toEqual([{ rotate: '-90deg' }]);
  });

  it('never publishes a selected state on a category row that carries the selected treatment', async () => {
    const component = await renderNavItem({ label: 'Mail', selected: true, type: 'category' });

    expect(getRoot(component, 'button').props.accessibilityState).toEqual({ disabled: false, expanded: false });
    expect(getRootStyle(component, 'button').backgroundColor).toBe(colors.backgroundNeutralSoft);
  });

  it('owns the semantic role and category accessibility state', async () => {
    const category = await renderNavItem({
      accessibilityState: { busy: true, selected: true },
      label: 'Mail',
      type: 'category',
    });

    expect(getRoot(category, 'button').props.accessibilityState).toEqual({ busy: true, disabled: false, expanded: false });

    const item = await renderNavItem({ label: 'Inbox' });
    expect(getRoot(item).props.role).toBe('link');
  });

  it.each([['comfortable', 12, 10, 20, 20] as const, ['compact', 8, 6, 16, 16] as const])(
    'resolves the %s density',
    async (density, paddingHorizontal, paddingVertical, leadingSize, avatarSize) => {
      const component = await renderNavItem({
        avatar: { testID: 'avatar' },
        density,
        icon: { imageSource: { uri: 'icon.png' }, testID: 'icon' },
        label: density,
      });
      const rootStyle = getRootStyle(component);

      expect(rootStyle.paddingStart).toBe(paddingHorizontal);
      expect(rootStyle.paddingEnd).toBe(paddingHorizontal);
      expect(rootStyle.paddingVertical).toBe(paddingVertical);
      expect(StyleSheet.flatten(component.getByTestId('avatar', { includeHiddenElements: true }).props.style as ViewStyle).width).toBe(
        avatarSize,
      );

      const iconOnly = await renderNavItem({
        density,
        icon: { imageSource: { uri: 'icon.png' }, testID: 'icon' },
        label: density,
      });
      expect(StyleSheet.flatten(iconOnly.getByTestId('icon').props.style as ViewStyle)).toMatchObject({
        height: leadingSize,
        width: leadingSize,
      });
    },
  );

  it('indents a sub item without changing its trailing padding', async () => {
    const topLevel = await renderNavItem({ label: 'Mail' });
    const subItem = await renderNavItem({ label: 'Focused', nesting: 'subItem' });

    expect(getRootStyle(topLevel).paddingStart).toBe(12);
    expect(getRootStyle(subItem).paddingStart).toBe(28);
    expect(getRootStyle(subItem).paddingEnd).toBe(12);
  });

  it('collapses to an icon rail row without the label or trailing regions', async () => {
    const component = await renderNavItem({
      accessibilityLabel: 'Inbox',
      icon: { imageSource: { uri: 'icon.png' }, testID: 'icon' },
      showLabel: false,
      trailingActions: { children: <Button content="More" />, testID: 'trailing-actions' },
      trailingContent: '12',
      type: 'category',
    });

    expect(component.getByTestId('icon')).toBeOnTheScreen();
    expect(component.queryByText('Nav item', { includeHiddenElements: true })).toBeNull();
    expect(component.queryByText('12', { includeHiddenElements: true })).toBeNull();
    expect(component.queryByTestId('trailing-actions')).toBeNull();
    expect(component.queryByTestId('nav-item-chevron')).toBeNull();
    expect(getRootStyle(component, 'button').justifyContent).toBe('center');
  });

  it('warns when a collapsed rail row has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await renderNavItem({ showLabel: false } as NavItemProps);

    expect(warn).toHaveBeenCalledWith('NavItem: a collapsed rail row requires an accessibilityLabel that names the destination.');
    warn.mockRestore();
  });

  it('resolves hover, press, and focus visuals on the root', async () => {
    const onHoverIn = jest.fn();
    const component = await renderNavItem({ label: 'Inbox', onHoverIn });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).toBe(colors.hover.backgroundNeutralTransparent);

    await fireEvent(root, 'focus', {});
    expect(
      StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style as ViewStyle),
    ).toMatchObject({
      borderColor: colors.strokeFocusOuter,
    });
  });

  it('disables interaction and mutes the selected indicator when disabled', async () => {
    const onPress = jest.fn();
    const component = await renderNavItem({ disabled: true, label: 'Inbox', onPress, selected: true });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true, selected: true });
    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralSubtleDisabled);
    expect(getIndicatorStyle(component).backgroundColor).toBe(colors.strokeNeutralDisabled);

    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps disabled rows out of the tab order when focusable is requested', async () => {
    const component = await renderNavItem({ disabled: true, focusable: true, label: 'Inbox' });

    expect(getRoot(component).props.focusable).toBe(false);
  });

  it('merges caller accessibility state and applies the caller style last', async () => {
    const props: Pick<PressableProps, 'accessibilityState'> = { accessibilityState: { busy: true } };
    const component = await renderNavItem({ label: 'Inbox', style: { backgroundColor: 'hotpink' }, ...props });

    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false, selected: false });
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('does not activate the row when a nested trailing action is pressed', async () => {
    const onPress = jest.fn();
    const onActionPress = jest.fn();
    const component = await renderNavItem({
      label: 'Inbox',
      onPress,
      trailingActions: { children: <Button content="More" onPress={onActionPress} testID="action" /> },
    });

    await fireEvent.press(component.getByTestId('action'));

    expect(onActionPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });
});
