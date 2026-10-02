/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text as NativeText, View } from 'react-native';
import type { TextProps as NativeTextProps, TextStyle, ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { FlexThemeReference, ThemeProvider } from '@fluentui-react-native/design';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Input } from '../input/input';
import type { Text } from '../text/text';
import { Label } from './label';
import type { LabelProps, LabelState } from './label.types';
import { renderLabel_unstable } from './renderLabel';
import { useLabel_unstable } from './useLabel';
import { useLabelStyles_unstable } from './useLabelStyles';

const includeHidden = { includeHiddenElements: true } as const;

function renderLabel(props: LabelProps = {}) {
  return render(<Label testID="label-root" {...props} />);
}

type RenderedLabel = Awaited<ReturnType<typeof renderLabel>>;

function getRoot(component: RenderedLabel) {
  return component.getByRole('text');
}

function getTextStyle(component: RenderedLabel, text: string): TextStyle {
  return StyleSheet.flatten(component.getByText(text, includeHidden).props.style);
}

function ReplacementText(props: NativeTextProps & { ref?: React.Ref<React.ComponentRef<typeof NativeText>> }) {
  return <NativeText {...props} />;
}

describe('Label', () => {
  it('renders default medium regular content as one nonfocusable named text root', async () => {
    const component = await renderLabel();
    const tokens = defaultFlexTokens;
    expect(component.getAllByRole('text')).toHaveLength(1);
    expect(getRoot(component).props).toMatchObject({
      accessibilityLabel: 'Label',
      accessibilityRole: 'text',
      accessible: true,
      focusable: false,
    });
    expect(getRoot(component).props.role).toBeUndefined();
    expect(getTextStyle(component, 'Label')).toMatchObject({
      color: tokens.color.foregroundNeutralPrimary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodyMedium,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodyMedium,
      flexShrink: 1,
    });
    expect(StyleSheet.flatten(getRoot(component).props.style)).toMatchObject({
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      gap: tokens.spacing.componentBase50,
      padding: 0,
    });
    expect(component.queryByText('*', includeHidden)).toBeNull();
  });

  it.each([
    { content: 'Display name', expected: 'Display name' },
    { content: 0, expected: '0' },
    { content: 42, expected: '42' },
    { content: { children: 'Slot name' }, expected: 'Slot name' },
    { content: { children: 0 }, expected: '0' },
  ])('derives a native name from scalar content: $expected', async ({ content, expected }) => {
    const component = await renderLabel({ content });
    expect(getRoot(component).props.accessibilityLabel).toBe(expected);
  });

  it.each([
    { accessibilityLabel: 'Explicit name', 'aria-label': 'Alias name', expected: 'Explicit name' },
    { 'aria-label': 'Alias name', expected: 'Alias name' },
    { accessibilityLabel: '  Preserve spaces  ', expected: '  Preserve spaces  ' },
  ])('normalizes name precedence without trimming the native name: $expected', async ({ expected, ...props }) => {
    const component = await renderLabel({ content: 'Content name', ...props });
    expect(getRoot(component).props.accessibilityLabel).toBe(expected);
    expect(getRoot(component).props['aria-label']).toBeUndefined();
  });

  it('keeps content and marker as ordered native Text siblings with no content wrapper', async () => {
    const component = await renderLabel({ content: 'Display name', required: true });
    const root = getRoot(component);
    expect(root.children).toHaveLength(2);
    expect(component.getByText('Display name', includeHidden).type).toBe('Text');
    expect(component.getByText('*', includeHidden).type).toBe('Text');
    expect(root.children[0]).toBe(component.getByText('Display name', includeHidden));
    expect(root.children[1]).toBe(component.getByText('*', includeHidden));
    expect(root.props.accessibilityLabel).toBe('Display name');
  });

  it.each([false, true])('constructs the marker only while required=%s', async (required) => {
    const component = await renderLabel({ content: 'Name', required, requiredIndicator: 'Required' });
    expect(component.queryByText('Required', includeHidden) !== null).toBe(required);
  });

  it('allows a custom marker and explicit marker suppression independently of required', async () => {
    const component = await renderLabel({ content: 'Name', required: true, requiredIndicator: '(required)' });
    expect(component.getByText('(required)', includeHidden)).toBeOnTheScreen();
    expect(getRoot(component).props.accessibilityLabel).toBe('Name');
    await component.rerender(<Label content="Name" required requiredIndicator={null} />);
    expect(component.queryByText('(required)', includeHidden)).toBeNull();
    expect(component.queryByText('*', includeHidden)).toBeNull();
    expect(getRoot(component).children).toHaveLength(1);
  });

  it('forces both descendants to remain decorative despite caller exposure props', async () => {
    const component = await renderLabel({
      content: {
        children: 'Name',
        accessible: true,
        accessibilityElementsHidden: false,
        importantForAccessibility: 'yes',
      },
      required: true,
      requiredIndicator: {
        children: 'Required',
        accessible: true,
        accessibilityElementsHidden: false,
        importantForAccessibility: 'yes',
      },
    });
    for (const text of ['Name', 'Required']) {
      expect(component.getByText(text, includeHidden).props).toMatchObject({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      });
    }
    expect(component.getAllByRole('text')).toHaveLength(1);
  });

  it.each(['small', 'medium', 'large'] as const)('maps both text slots to %s typography', async (size) => {
    const component = await renderLabel({ content: 'Name', size, required: true });
    const typography = {
      small: 'functionalBodySmall',
      medium: 'functionalBodyMedium',
      large: 'functionalBodyLarge',
    } as const;
    const key = typography[size];
    for (const text of ['Name', '*']) {
      expect(getTextStyle(component, text)).toMatchObject({
        fontSize: defaultFlexTokens.fontSize[key],
        lineHeight: defaultFlexTokens.lineHeight[key],
      });
    }
  });

  it.each(['regular', 'strong'] as const)('maps both text slots to %s weight', async (weight) => {
    const component = await renderLabel({ content: 'Name', weight, required: true });
    const key = weight === 'regular' ? 'functionalRegular' : 'functionalSemibold';
    for (const text of ['Name', '*']) {
      expect(getTextStyle(component, text).fontWeight).toBe(defaultFlexTokens.fontWeight[key]);
    }
  });

  it.each([false, true])('sets foregrounds without semantic control state while disabled=%s', async (disabled) => {
    const component = await renderLabel({ content: 'Name', disabled, required: true });
    const colors = defaultFlexTokens.color;
    expect(getTextStyle(component, 'Name').color).toBe(disabled ? colors.foregroundNeutralDisabled : colors.foregroundNeutralPrimary);
    expect(getTextStyle(component, '*').color).toBe(disabled ? colors.foregroundNeutralDisabled : colors.foregroundDangerPrimary);
    expect(getRoot(component).props.accessibilityState).toBeUndefined();
    expect(getRoot(component).props.focusable).toBe(false);
  });

  it.each(
    (['small', 'medium', 'large'] as const).flatMap((size) =>
      (['regular', 'strong'] as const).flatMap((weight) =>
        [false, true].flatMap((required) => [false, true].map((disabled) => ({ size, weight, required, disabled }))),
      ),
    ),
  )('composes all finite axes: $size/$weight required=$required disabled=$disabled', async (props) => {
    const component = await renderLabel({ content: 'Name', ...props });
    expect(getRoot(component).props.accessibilityLabel).toBe('Name');
    expect(component.queryByText('*', includeHidden) !== null).toBe(props.required);
    expect(getTextStyle(component, 'Name').color).toBe(
      props.disabled ? defaultFlexTokens.color.foregroundNeutralDisabled : defaultFlexTokens.color.foregroundNeutralPrimary,
    );
    if (props.required) {
      expect(getTextStyle(component, '*').color).toBe(
        props.disabled ? defaultFlexTokens.color.foregroundNeutralDisabled : defaultFlexTokens.color.foregroundDangerPrimary,
      );
    }
  });

  it('applies caller styles after Text defaults and Label styles, without mutating them', async () => {
    const contentStyle = Object.freeze({ color: '#123456', fontSize: 29, flexShrink: 0 });
    const indicatorStyle = Object.freeze({ color: '#654321', fontWeight: '900' } as const);
    const rootStyle: ViewStyle = Object.freeze({ alignSelf: 'stretch', gap: 9, paddingBottom: 4 });
    const component = await renderLabel({
      content: { children: 'Name', style: contentStyle },
      required: true,
      disabled: true,
      requiredIndicator: { children: '*', style: indicatorStyle },
      style: rootStyle,
    });
    expect(getTextStyle(component, 'Name')).toMatchObject(contentStyle);
    expect(getTextStyle(component, '*')).toMatchObject(indicatorStyle);
    expect(StyleSheet.flatten(getRoot(component).props.style)).toMatchObject(rootStyle);
    await component.rerender(<Label content="Name" required />);
    expect(getTextStyle(component, 'Name').fontSize).toBe(defaultFlexTokens.fontSize.functionalBodyMedium);
    expect(getTextStyle(component, '*').color).toBe(defaultFlexTokens.color.foregroundDangerPrimary);
  });

  it('resolves custom theme bindings for both slots without leaking instance values', async () => {
    const theme = new FlexThemeReference({
      base: {
        color: { foregroundNeutralPrimary: '#112233', foregroundDangerPrimary: '#aa1122' },
        fontSize: { functionalBodySmall: 13 },
        lineHeight: { functionalBodySmall: 19 },
        spacing: { componentBase50: 3 },
      },
    });
    const component = await render(
      <ThemeProvider theme={theme}>
        <Label content="First" required size="small" />
        <Label content="Second" required size="small" />
      </ThemeProvider>,
    );
    expect(getTextStyle(component, 'First')).toMatchObject({ fontSize: 13, lineHeight: 19, color: '#112233' });
    expect(getTextStyle(component, 'Second')).toMatchObject({ fontSize: 13, lineHeight: 19, color: '#112233' });
    expect(StyleSheet.flatten(component.getAllByRole('text')[0].props.style).gap).toBe(3);
    expect(component.getAllByText('*', includeHidden).map((item) => StyleSheet.flatten(item.props.style).color)).toEqual([
      '#aa1122',
      '#aa1122',
    ]);
  });

  it('reuses cached theme styles across instances', async () => {
    const create = jest.spyOn(StyleSheet, 'create');
    try {
      await renderLabel({ content: 'First' });
      const count = create.mock.calls.length;
      await renderLabel({ content: 'Second', required: true, disabled: true, weight: 'strong' });
      expect(create).toHaveBeenCalledTimes(count);
    } finally {
      create.mockRestore();
    }
  });

  it.each([
    { content: '', accessibilityLabel: undefined },
    { content: '  ', accessibilityLabel: undefined },
    { content: 'Visible', accessibilityLabel: '' },
    { content: 'Visible', accessibilityLabel: '   ' },
    { content: { children: <NativeText>Complex</NativeText> }, accessibilityLabel: undefined },
  ])('warns for unresolved or blank accessible names without inventing a replacement', async (props) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    try {
      const component = await renderLabel({ ...props, accessibilityLabelledBy: 'unverified-reference' });
      expect(warn).toHaveBeenCalledWith('Label: accessible content requires a non-empty accessibilityLabel or scalar content.');
      if (props.accessibilityLabel !== undefined) {
        expect(getRoot(component).props.accessibilityLabel).toBe(props.accessibilityLabel);
      }
    } finally {
      warn.mockRestore();
    }
  });

  it('accepts explicitly named complex content and warns again after a valid name becomes invalid', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    try {
      const component = await renderLabel({ content: { children: <NativeText>Complex</NativeText> }, accessibilityLabel: 'Complex' });
      expect(warn).not.toHaveBeenCalled();
      await component.rerender(<Label content="" />);
      expect(warn).toHaveBeenCalledTimes(1);
      await component.rerender(<Label content="" />);
      expect(warn).toHaveBeenCalledTimes(1);
      await component.rerender(<Label content="Valid" />);
      await component.rerender(<Label content="" />);
      expect(warn).toHaveBeenCalledTimes(2);
    } finally {
      warn.mockRestore();
    }
  });

  it('keeps a forwarded native tab-index alias out of keyboard traversal', async () => {
    const nativeAliases = { tabIndex: 0 as const };
    const component = await renderLabel({ ...nativeAliases, content: 'Name' });
    expect(getRoot(component).props.focusable).toBe(false);
  });

  it('allows a visual-only strong medium legend with no separate Label announcement', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    try {
      const component = await renderLabel({
        accessible: false,
        content: { children: <NativeText>Delivery preference</NativeText> },
        weight: 'strong',
        required: true,
        nativeID: 'delivery-legend',
      });
      expect(component.queryAllByRole('text')).toHaveLength(0);
      expect(component.getByTestId('label-root', includeHidden).props).toMatchObject({
        accessible: false,
        focusable: false,
        nativeID: 'delivery-legend',
      });
      expect(component.getByText('*', includeHidden).props.accessible).toBe(false);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('names the actual editor explicitly without creating a native relationship', async () => {
    const component = await render(
      <View>
        <Label content="Display name" nativeID="display-label" required />
        <Input textInput={{ accessibilityLabel: 'Display name' }} />
      </View>,
    );
    expect(component.getByRole('text').props.nativeID).toBe('display-label');
    expect(component.getByRole('textbox').props.accessibilityLabel).toBe('Display name');
    expect(component.getByRole('textbox').props.accessibilityLabelledBy).toBeUndefined();
  });

  it('forwards identifiers and layout callbacks without focus, activation, or animation plumbing', async () => {
    const onLayout = jest.fn();
    const component = await renderLabel({ content: 'Name', nativeID: 'native-name', onLayout });
    const root = getRoot(component);
    const layoutEvent = { nativeEvent: { layout: { x: 0, y: 0, width: 80, height: 20 } } };
    await fireEvent(root, 'layout', layoutEvent);
    expect(onLayout).toHaveBeenCalledWith(layoutEvent);
    expect(root.props.nativeID).toBe('native-name');
    for (const key of ['onPress', 'onHoverIn', 'onFocus', 'onKeyDown', 'accessibilityActions', 'enableFocusRing']) {
      expect(root.props[key]).toBeUndefined();
    }
  });

  it('preserves unconstrained text metrics, wrapping, and native scaling props', async () => {
    const component = await renderLabel({
      content: { children: 'Long label text', allowFontScaling: true, maxFontSizeMultiplier: 2 },
      required: true,
      style: { width: 120, direction: 'rtl' },
    });
    const text = component.getByText('Long label text', includeHidden);
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.maxFontSizeMultiplier).toBe(2);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(getTextStyle(component, 'Long label text').height).toBeUndefined();
    expect(getTextStyle(component, '*').flexShrink).toBe(0);
    expect(StyleSheet.flatten(getRoot(component).props.style).height).toBeUndefined();
  });

  it('preserves explicitly requested native text layout overrides', async () => {
    const component = await renderLabel({
      content: { children: 'Name', numberOfLines: 1, allowFontScaling: false, style: { lineHeight: 30 } },
    });
    expect(component.getByText('Name', includeHidden).props.numberOfLines).toBe(1);
    expect(component.getByText('Name', includeHidden).props.allowFontScaling).toBe(false);
    expect(getTextStyle(component, 'Name').lineHeight).toBe(30);
  });

  it('forwards distinct native root and inner object refs and clears them on detach', async () => {
    const rootRef = React.createRef<React.ComponentRef<typeof View>>();
    const textRef = React.createRef<React.ComponentRef<typeof Text>>();
    const indicatorRef = React.createRef<React.ComponentRef<typeof Text>>();
    const component = await renderLabel({
      content: { children: 'Name', ref: textRef },
      required: true,
      requiredIndicator: { ref: indicatorRef },
      ref: rootRef,
    });
    expect(rootRef.current).not.toBeNull();
    expect(textRef.current).not.toBeNull();
    expect(indicatorRef.current).not.toBeNull();
    expect(rootRef.current).not.toBe(textRef.current);
    expect(textRef.current).not.toBe(indicatorRef.current);
    const mountedRoot = rootRef.current;
    const mountedText = textRef.current;
    await component.rerender(
      <Label ref={rootRef} content={{ children: 'Changed', ref: textRef }} required requiredIndicator={{ ref: indicatorRef }} />,
    );
    expect(rootRef.current).toBe(mountedRoot);
    expect(textRef.current).toBe(mountedText);
    await component.unmount();
    expect(rootRef.current).toBeNull();
    expect(textRef.current).toBeNull();
    expect(indicatorRef.current).toBeNull();
  });

  it('preserves callback cleanup, stable rerenders, and marker removal', async () => {
    const cleanup = jest.fn();
    const rootRef = jest.fn((_instance: React.ComponentRef<typeof View> | null) => cleanup);
    const textCleanup = jest.fn();
    const textRef = jest.fn((_instance: React.ComponentRef<typeof Text> | null) => textCleanup);
    const indicatorCleanup = jest.fn();
    const indicatorRef = jest.fn((_instance: React.ComponentRef<typeof Text> | null) => indicatorCleanup);
    const props: LabelProps = {
      content: { children: 'Name', ref: textRef },
      ref: rootRef,
      required: true,
      requiredIndicator: { ref: indicatorRef },
    };
    const component = await renderLabel(props);
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(textRef).toHaveBeenCalledTimes(1);
    expect(indicatorRef).toHaveBeenCalledTimes(1);
    await component.rerender(<Label {...props} required={false} />);
    expect(rootRef).toHaveBeenCalledTimes(1);
    expect(textRef).toHaveBeenCalledTimes(1);
    expect(indicatorCleanup).toHaveBeenCalledTimes(1);
    await component.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(textCleanup).toHaveBeenCalledTimes(1);
  });

  it('detaches a replaced callback ref without replacing the native root', async () => {
    const firstCleanup = jest.fn();
    const first = jest.fn((_instance: React.ComponentRef<typeof View> | null) => firstCleanup);
    const second = jest.fn();
    const component = await renderLabel({ content: 'Name', ref: first });
    const target = first.mock.calls[0];
    await component.rerender(<Label content="Name" ref={second} />);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(second.mock.calls[0]).toEqual(target);
    await component.unmount();
    expect(second.mock.calls.at(-1)?.[0]).toBeNull();
  });

  it('forwards compatible replacement Text refs and styles through both slots', async () => {
    const contentRef = React.createRef<React.ComponentRef<typeof NativeText>>();
    const indicatorRef = React.createRef<React.ComponentRef<typeof NativeText>>();
    const component = await renderLabel({
      content: { as: ReplacementText, children: 'Replacement', ref: contentRef, style: { color: '#123456' } },
      required: true,
      requiredIndicator: { as: ReplacementText, children: '!', ref: indicatorRef },
    });
    expect(contentRef.current).not.toBeNull();
    expect(indicatorRef.current).not.toBeNull();
    expect(getTextStyle(component, 'Replacement').color).toBe('#123456');
    expect(getRoot(component).props.accessibilityLabel).toBe('Replacement');
    expect(component.getByText('!', includeHidden).props.accessible).toBe(false);
    await component.unmount();
    expect(contentRef.current).toBeNull();
    expect(indicatorRef.current).toBeNull();
  });

  it('supports stage composition while keeping the root slot identity stable', async () => {
    const seen: LabelState[] = [];
    function Harness(props: LabelProps) {
      const state = useLabel_unstable(props);
      useLabelStyles_unstable(state);
      seen.push(state);
      return renderLabel_unstable(state);
    }
    const component = await render(<Harness content="First" />);
    await component.rerender(<Harness content="Second" required />);
    expect(seen[0].root).toBe(seen[1].root);
    expect(seen[0].content).toBe(seen[1].content);
    expect(seen[1]).toMatchObject({ size: 'medium', weight: 'regular', required: true, disabled: false });
    expect(component.getByRole('text').props.accessibilityLabel).toBe('Second');
  });

  it('ignores runtime attempts to change the owned role or focusability in the root render stage', async () => {
    function Harness() {
      const state = useLabel_unstable({ content: 'Name' });
      useLabelStyles_unstable(state);
      return <state.root accessibilityRole="button" role="button" focusable />;
    }
    const component = await render(<Harness />);
    expect(component.getByRole('text').props.focusable).toBe(false);
    expect(component.queryByRole('button')).toBeNull();
  });
});
