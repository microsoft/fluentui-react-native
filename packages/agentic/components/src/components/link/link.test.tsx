/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Linking, StyleSheet } from 'react-native';
import type { Text as NativeText, TextStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Link } from './link';
import { linkIconSize } from './link.styles';

const destination = 'https://example.com/invoice';

function renderLink(props: React.ComponentProps<typeof Link>): Promise<RenderResult> {
  return render(<Link {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('link');
}

function getRootStyle(component: RenderResult): TextStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getContentStyle(component: RenderResult, label = 'Link'): TextStyle {
  return StyleSheet.flatten(component.getByText(label).props.style);
}

describe('Link', () => {
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    openURL = jest.spyOn(Linking, 'openURL');
    openURL.mockReset();
    openURL.mockResolvedValue(true);
  });

  afterEach(() => {
    openURL.mockRestore();
  });

  // LNK-001, LNK-002, LNK-003, LNK-010
  it('renders a single accessible link with the default label and no icon', async () => {
    const component = await renderLink({});
    const root = getRoot(component);

    expect(root.props.role).toBe('link');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.accessible).toBe(true);
    expect(root.props.focusable).toBe(true);
    expect(component.getByText('Link')).toBeOnTheScreen();
    expect(root.children).toHaveLength(1);
  });

  // LNK-001
  it('forwards the root ref as a prop', async () => {
    const ref = React.createRef<NativeText>();
    await renderLink({ content: 'Docs', ref });

    expect(ref.current).not.toBeNull();
  });

  // LNK-002, LNK-003
  it('renders the label before the trailing icon inside one root', async () => {
    const component = await renderLink({
      content: 'Open the report',
      icon: { fontSource: { codepoint: 0x2197, fontFamily: 'Arial' } },
    });

    expect(getRoot(component).children).toHaveLength(2);
    expect(component.getByText('Open the report')).toBeOnTheScreen();
  });

  // LNK-007, LNK-008
  it('hides the underline at rest and reveals it while pressed', async () => {
    const component = await renderLink({ content: 'Terms' });
    const root = getRoot(component);

    expect(getContentStyle(component, 'Terms').textDecorationLine).toBe('none');
    expect(getContentStyle(component, 'Terms').color).toBe(defaultFlexTokens.color.foregroundNeutralPrimary);

    await fireEvent(root, 'pressIn', {});
    expect(getContentStyle(component, 'Terms').textDecorationLine).toBe('underline');
    // The default theme maps the pressed override to the rest value, so this asserts the resolved
    // source rather than a visible shift.
    expect(getContentStyle(component, 'Terms').color).toBe(defaultFlexTokens.color.pressed.foregroundNeutralPrimary);

    await fireEvent(root, 'pressOut', {});
    expect(getContentStyle(component, 'Terms').textDecorationLine).toBe('none');
    expect(getContentStyle(component, 'Terms').color).toBe(defaultFlexTokens.color.foregroundNeutralPrimary);
  });

  // LNK-004, LNK-008, LNK-011
  it('reveals the underline and the focus border while focused', async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const component = await renderLink({ content: 'Terms', onBlur, onFocus });
    const root = getRoot(component);

    expect(getRootStyle(component).borderColor).toBe('transparent');
    expect(getRootStyle(component).borderWidth).toBe(defaultFlexTokens.strokeWidth.thick);
    expect(getRootStyle(component).borderRadius).toBe(defaultFlexTokens.borderRadius.base100);

    await fireEvent(root, 'focus', {});
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(getContentStyle(component, 'Terms').textDecorationLine).toBe('underline');
    expect(getRootStyle(component).borderColor).toBe(defaultFlexTokens.color.strokeFocusOuter);
    expect(getRootStyle(component).borderWidth).toBe(defaultFlexTokens.strokeWidth.thick);

    await fireEvent(root, 'blur', {});
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).borderColor).toBe('transparent');
  });

  // LNK-008, LNK-009
  it('keeps an inline link underlined and lets it inherit surrounding typography', async () => {
    const component = await renderLink({ content: 'privacy statement', inline: true });
    const contentStyle = getContentStyle(component, 'privacy statement');

    expect(contentStyle.textDecorationLine).toBe('underline');
    expect(contentStyle.fontFamily).toBeUndefined();
    expect(contentStyle.fontSize).toBeUndefined();
    expect(contentStyle.lineHeight).toBeUndefined();
  });

  // LNK-009
  it('applies each type set typography to a standalone link', async () => {
    const functional = await renderLink({ content: 'Functional' });
    expect(getContentStyle(functional, 'Functional')).toMatchObject({
      fontFamily: defaultFlexTokens.fontFamily.functional,
      fontSize: defaultFlexTokens.fontSize.functionalBodyMedium,
      lineHeight: defaultFlexTokens.lineHeight.functionalBodyMedium,
    });

    const contentSet = await renderLink({ content: 'Editorial', typeSet: 'content' });
    expect(getContentStyle(contentSet, 'Editorial')).toMatchObject({
      fontFamily: defaultFlexTokens.fontFamily.content,
      fontSize: defaultFlexTokens.fontSize.contentParagraphMedium,
      lineHeight: defaultFlexTokens.lineHeight.contentParagraphMedium,
    });
  });

  // LNK-005
  it('calls onPress before navigating and navigates only once', async () => {
    const onPress = jest.fn();
    const component = await renderLink({ content: 'Invoice', onPress, url: destination });

    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledWith(destination);
    expect(onPress.mock.invocationCallOrder[0]).toBeLessThan(openURL.mock.invocationCallOrder[0]);
  });

  // LNK-005
  it('calls onPress without navigating when no destination is set', async () => {
    const onPress = jest.fn();
    const component = await renderLink({ content: 'Delegated', onPress });

    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(openURL).not.toHaveBeenCalled();
  });

  // LNK-006
  it('reports a navigation rejection to onNavigationError', async () => {
    const failure = new Error('no handler for scheme');
    openURL.mockRejectedValue(failure);
    const onNavigationError = jest.fn();
    const component = await renderLink({ content: 'Invoice', onNavigationError, url: destination });

    await fireEvent.press(getRoot(component));
    await Promise.resolve();

    expect(onNavigationError).toHaveBeenCalledWith(failure);
  });

  it('reports a synchronous navigation failure to onNavigationError', async () => {
    const failure = new Error('invalid URL');
    openURL.mockImplementation(() => {
      throw failure;
    });
    const onNavigationError = jest.fn();
    const component = await renderLink({ content: 'Invoice', onNavigationError, url: '' });

    await fireEvent.press(getRoot(component));

    expect(onNavigationError).toHaveBeenCalledWith(failure);
  });

  // LNK-006
  it('leaves the navigation rejection untouched when no handler is supplied', async () => {
    const failure = new Error('no handler for scheme');
    const navigation = Promise.reject(failure);
    // Attached here so the test runner never sees an unhandled rejection. Link itself attaches nothing.
    navigation.catch(() => undefined);
    openURL.mockReturnValue(navigation);
    const component = await renderLink({ content: 'Invoice', url: destination });

    await fireEvent.press(getRoot(component));

    expect(openURL).toHaveBeenCalledWith(destination);
    await expect(navigation).rejects.toBe(failure);
  });

  // LNK-005, LNK-007, LNK-010
  it('blocks activation, leaves the tab order, and dims a disabled link', async () => {
    const component = await renderLink({ content: 'Unavailable', disabled: true, onPress: jest.fn(), url: destination });
    const root = getRoot(component);

    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(root.props.focusable).toBe(false);
    expect(getContentStyle(component, 'Unavailable').color).toBe(defaultFlexTokens.color.foregroundNeutralDisabled);

    // Activation is blocked by never attaching the handlers to the root rather than by guarding inside
    // them, so the platform has nothing to invoke.
    expect(root.props.onPress).toBeUndefined();
    expect(root.props.onPressIn).toBeUndefined();
    expect(root.props.onPressOut).toBeUndefined();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('keeps a disabled link out of the tab order when focusable is requested', async () => {
    const component = await renderLink({ content: 'Unavailable', disabled: true, focusable: true });

    expect(getRoot(component).props.focusable).toBe(false);
  });

  // LNK-010
  it('merges caller accessibility state under the disabled state', async () => {
    const component = await renderLink({ accessibilityState: { expanded: true }, content: 'Details' });

    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false, expanded: true });
  });

  // LNK-012
  it('sizes the trailing glyph and paints it with the resolved foreground', async () => {
    const gap = Number(defaultFlexTokens.spacing.componentBase50);
    const component = await renderLink({
      content: 'Open the report',
      icon: { fontSource: { codepoint: 0x2197, fontFamily: 'Arial' } },
    });
    const icon = component.getByText(String.fromCodePoint(0x2197));
    const iconStyle = StyleSheet.flatten(icon.props.style) as TextStyle;

    expect(icon.props.accessible).toBe(false);
    expect(iconStyle.color).toBe(defaultFlexTokens.color.foregroundNeutralPrimary);
    expect(iconStyle.height).toBe(linkIconSize);
    expect(iconStyle.width).toBe(linkIconSize + gap * 2);
  });

  // LNK-001
  it('applies the user style after the resolved root styles', async () => {
    const component = await renderLink({ content: 'Styled', style: { borderColor: 'rebeccapurple' } });

    expect(getRootStyle(component).borderColor).toBe('rebeccapurple');
  });

  // LNK-002, LNK-010
  it('warns when the label is suppressed without an accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const component = await renderLink({ content: null });

      expect(component.queryByText('Link')).toBeNull();
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
