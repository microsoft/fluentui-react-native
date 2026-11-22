/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, type View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { render } from '../../common/renderWithTheme';

import { FlexThemeReference, ThemeProvider } from '@fluentui-react-native/design';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Badge } from './badge';

const badgeIcon = { fontSource: { codepoint: 0x2022, fontFamily: 'Arial' } } as const;
const trailingIcon = { fontSource: { codepoint: 0x2713, fontFamily: 'Arial' } } as const;

function renderBadge(props: React.ComponentProps<typeof Badge>) {
  return render(<Badge {...props} />);
}

function getRoot(component: Awaited<ReturnType<typeof renderBadge>>) {
  return component.getByRole('image');
}

function getRootStyle(component: Awaited<ReturnType<typeof renderBadge>>): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getIcon(component: Awaited<ReturnType<typeof renderBadge>>, id: string) {
  return component.getByTestId(id, { includeHiddenElements: true });
}

function getGlyphPath(node: ReturnType<typeof getIcon>): string | undefined {
  if (typeof node.props.d === 'string') return node.props.d;
  for (const child of node.children) {
    if (typeof child !== 'string') {
      const path = getGlyphPath(child);
      if (path) return path;
    }
  }
  return undefined;
}

describe('Badge', () => {
  it('BDG-002 forwards the root ref and permits a deliberately empty badge without restoring default content', async () => {
    const ref = React.createRef<React.ComponentRef<typeof View>>();
    const component = await renderBadge({
      accessibilityLabel: 'Status',
      content: null,
      leadingIconVisible: false,
      ref,
      testID: 'empty-badge',
    });
    expect(ref.current).not.toBeNull();
    expect(component.getByTestId('empty-badge').children).toHaveLength(1); // Only the decorative tint layer.
    expect(component.queryByText('Badge')).toBeNull();
    expect(getRoot(component).props).toMatchObject({ accessibilityLabel: 'Status', focusable: false });
    await component.unmount();
    expect(ref.current).toBeNull();
  });

  it('BDG-002/BDG-004 hides an unnamed default badge and renders no unsupplied trailing icon', async () => {
    const component = await renderBadge({ testID: 'badge', trailingIconVisible: true });

    expect(component.queryByRole('image')).toBeNull();
    const root = component.getByTestId('badge', { includeHiddenElements: true });
    expect(root.props).toMatchObject({
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      focusable: false,
    });
    expect(component.getByText('Badge', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(root.children).toHaveLength(3);
  });

  it.each([
    [false, false, ['content']],
    [false, true, ['content', 'trailing-icon']],
    [true, false, ['leading-icon', 'content']],
    [true, true, ['leading-icon', 'content', 'trailing-icon']],
  ] as const)('BDG-002 preserves slot order with leading=%s and trailing=%s', async (leadingIconVisible, trailingIconVisible, order) => {
    const component = await renderBadge({
      accessibilityLabel: 'Status',
      content: { children: 'Status', testID: 'content' },
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      trailingIcon: { ...trailingIcon, testID: 'trailing-icon' },
      leadingIconVisible,
      trailingIconVisible,
    });

    expect(
      getRoot(component)
        .children.slice(1)
        .map((child) => (typeof child === 'string' ? child : child.props.testID)),
    ).toEqual(order);
  });

  it('renders default icon-and-text styling with forwarded icons and label', async () => {
    const component = await renderBadge({
      accessibilityLabel: 'Badge',
      content: 'Badge',
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
    });
    const tokens = defaultFlexTokens;

    expect(getRoot(component).props.accessible).toBe(true);
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.surfaceNeutralNearer.rest,
      borderRadius: tokens.borderRadius.circular,
      minHeight: 20,
      paddingHorizontal: tokens.spacing.componentBase150,
    });
    expect(StyleSheet.flatten(component.getByText('Badge').props.style)).toMatchObject({
      color: tokens.color.foregroundNeutralPrimary.rest,
      fontFamily: expect.any(String),
      fontSize: tokens.fontSize.functionalBodySmall,
    });
    expect(StyleSheet.flatten(getIcon(component, 'leading-icon').props.style)).toMatchObject({
      height: 16,
      width: 16,
    });
    expect(
      StyleSheet.flatten(
        component.getByText(String.fromCodePoint(badgeIcon.fontSource.codepoint), { includeHiddenElements: true }).props.style,
      ),
    ).toMatchObject({
      color: tokens.color.foregroundNeutralPrimary.rest,
    });
  });

  it('renders icon-only badges with an accessible image role and ignores the label slot', async () => {
    const component = await renderBadge({
      accessibilityLabel: '3 unread messages',
      layout: 'iconOnly',
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
    });

    expect(getRoot(component).props.accessibilityRole).toBe('image');
    expect(getRoot(component).props.accessibilityLabel).toBe('3 unread messages');
    expect(component.queryByText('Badge')).toBeNull();
    expect(getIcon(component, 'leading-icon')).toBeOnTheScreen();
  });

  it('warns when an icon-only badge is missing an accessibility label', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await renderBadge({ layout: 'iconOnly' } as React.ComponentProps<typeof Badge>);

    expect(warn).toHaveBeenCalledWith('Badge: icon-only badges require an accessibilityLabel.');
    warn.mockRestore();
  });

  it('accepts an ARIA label as the accessible name for an icon-only badge', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderBadge({ 'aria-label': '3 unread messages', layout: 'iconOnly' });

    expect(getRoot(component).props).toMatchObject({
      accessibilityRole: 'image',
      accessible: true,
      'aria-label': '3 unread messages',
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('uses the trailing icon only when requested and applies user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderBadge({
      accessibilityLabel: 'New badge',
      content: { children: 'New', testID: 'content' },
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      trailingIcon: { ...trailingIcon, testID: 'trailing-icon' },
      trailingIconVisible: true,
      style,
    });

    expect(getRoot(component).children).toHaveLength(3);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(getIcon(component, 'trailing-icon')).toBeOnTheScreen();
  });

  it.each([
    ['tint', 'danger', 'backgroundDangerSoft', 'foregroundDangerPrimary', 'strokeNeutralTransparent', 0],
    ['tint', 'success', 'backgroundSuccessSoft', 'foregroundSuccessPrimary', 'strokeNeutralTransparent', 0],
    ['tint', 'warning', 'backgroundWarningSoft', 'foregroundWarningPrimary', 'strokeNeutralTransparent', 0],
    ['tint', 'informative', 'backgroundNeutralSoft', 'foregroundNeutralPrimary', 'strokeNeutralTransparent', 0],
    ['outline', 'danger', 'backgroundNeutralTransparent', 'foregroundDangerPrimary', 'strokeDangerLoud', 1],
    ['outline', 'success', 'backgroundNeutralTransparent', 'foregroundSuccessPrimary', 'strokeSuccessLoud', 1],
    ['outline', 'warning', 'backgroundNeutralTransparent', 'foregroundWarningPrimary', 'strokeWarningLoud', 1],
    ['outline', 'informative', 'backgroundNeutralTransparent', 'foregroundNeutralPrimary', 'strokeNeutralLoud', 1],
  ] as const)('BDG-003 resolves %s %s colors', async (appearance, color, backgroundToken, foregroundToken, borderToken, borderWidth) => {
    const tokens = defaultFlexTokens;
    const component = await renderBadge({
      accessibilityLabel: `${appearance} ${color} badge`,
      appearance,
      color,
      content: 'Badge',
      leadingIcon: badgeIcon,
    });

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: appearance === 'tint' ? tokens.color.surfaceNeutralNearer.rest : tokens.color[backgroundToken].rest,
      borderColor: tokens.color[borderToken].rest,
      borderWidth,
    });
    if (appearance === 'tint') {
      const tint = getRoot(component).children[0];
      if (typeof tint === 'string') throw new TypeError('Tint must be a native view.');
      expect(tint.props.pointerEvents).toBe('none');
      expect(StyleSheet.flatten(tint.props.style).backgroundColor).toBe(tokens.color[backgroundToken].rest);
    }
    expect(StyleSheet.flatten(component.getByText('Badge').props.style).color).toBe(tokens.color[foregroundToken].rest);
  });

  it.each([
    ['small', 16, 12, 'componentBase100', 'base100'],
    ['medium', 20, 16, 'componentBase150', 'base200'],
  ] as const)('resolves the %s size and shape', async (size, height, iconSize, paddingToken, roundedRadiusToken) => {
    const tokens = defaultFlexTokens;
    const rounded = await renderBadge({
      accessibilityLabel: `${size} badge`,
      content: size,
      leadingIcon: { ...badgeIcon, testID: 'leading-icon' },
      shape: 'rounded',
      size,
    });
    const circular = await renderBadge({
      accessibilityLabel: `${size} badge circular`,
      content: size,
      leadingIcon: { ...badgeIcon, testID: 'leading-icon-circular' },
      shape: 'circular',
      size,
    });

    expect(getRootStyle(rounded)).toMatchObject({
      minHeight: height,
      paddingHorizontal: tokens.spacing[paddingToken],
    });
    expect(StyleSheet.flatten(getIcon(rounded, 'leading-icon').props.style).height).toBe(iconSize);
    expect(StyleSheet.flatten(getIcon(rounded, 'leading-icon').props.style).width).toBe(iconSize);
    expect(getRootStyle(rounded).borderRadius).toBe(tokens.borderRadius[roundedRadiusToken]);
    expect(getRootStyle(circular).borderRadius).toBe(tokens.borderRadius.circular);
  });

  it('renders the default icon for a named icon-only status without adding a label slot', async () => {
    const component = await renderBadge({
      accessibilityLabel: 'Verified',
      layout: 'iconOnly',
      leadingIcon: { testID: 'default-icon' },
    });

    expect(getIcon(component, 'default-icon')).toBeOnTheScreen();
    expect(component.queryByText('Badge')).toBeNull();
    expect(getRoot(component).children).toHaveLength(2);
  });

  it('changes the default glyph with status and does not replace a caller glyph', async () => {
    const props = { appearance: 'outline', layout: 'iconOnly', accessibilityLabel: 'Status' } as const;
    const icon = { testID: 'status-icon' };
    const component = await renderBadge({ ...props, color: 'warning', leadingIcon: icon });
    const glyphPath = () => getGlyphPath(getIcon(component, 'status-icon'));
    const warning = glyphPath();
    expect(warning).toEqual(expect.any(String));

    await component.rerender(<Badge {...props} color="success" leadingIcon={icon} />);
    expect(glyphPath()).toEqual(expect.any(String));
    expect(glyphPath()).not.toBe(warning);

    await component.rerender(<Badge {...props} color="danger" leadingIcon={{ ...badgeIcon, testID: 'status-icon' }} />);
    expect(glyphPath()).toBeUndefined();
    expect(component.getByText(String.fromCodePoint(badgeIcon.fontSource.codepoint), { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('lets theme patches control the independently stacked tint layers', async () => {
    const theme = new FlexThemeReference({
      componentTokens: { 'furn.badge': { root: { backgroundColor: '#102030' }, tint: { backgroundColor: '#456789' } } },
    });
    const component = await render(
      <ThemeProvider theme={theme} appearance={{ colorScheme: 'dark', contrast: 'highContrast' }}>
        <Badge accessibilityLabel="Status" color="danger" />
      </ThemeProvider>,
    );

    expect(getRootStyle(component).backgroundColor).toBe('#102030');
    const tint = getRoot(component).children[0];
    if (typeof tint === 'string') throw new TypeError('Tint must be a native view.');
    expect(StyleSheet.flatten(tint.props.style).backgroundColor).toBe('#456789');
  });

  it.each([
    ['small', 16, 6],
    ['medium', 20, 8],
  ] as const)('keeps %s notifications decorative while switching from an expanding counter to a fixed dot', async (size, counter, dot) => {
    const component = await renderBadge({
      layout: 'counter',
      size,
      count: '99+',
      color: 'danger',
      testID: 'notification',
      accessible: true,
    });
    const getNotification = () => component.getByTestId('notification', { includeHiddenElements: true });
    const tokens = defaultFlexTokens;
    expect(getNotification().props).toMatchObject({
      accessible: false,
      focusable: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(StyleSheet.flatten(getNotification().props.style)).toMatchObject({
      minHeight: counter,
      minWidth: counter,
      backgroundColor: tokens.color.backgroundDangerLoud.rest,
    });
    expect(StyleSheet.flatten(getNotification().props.style).width).toBeUndefined();
    expect(StyleSheet.flatten(component.getByText('99+', { includeHiddenElements: true }).props.style).color).toBe(
      tokens.color.foregroundDangerOnloud.rest,
    );

    await component.rerender(<Badge layout="dot" size={size} testID="notification" />);
    expect(getNotification().children).toHaveLength(0);
    expect(StyleSheet.flatten(getNotification().props.style)).toMatchObject({
      width: dot,
      height: dot,
      borderRadius: tokens.borderRadius.circular,
      borderColor: tokens.color.strokeNeutralOnloud.rest,
    });
  });
});
