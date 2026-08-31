/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Tag } from './tag';

function renderTag(props: React.ComponentProps<typeof Tag>): Promise<RenderResult> {
  return render(<Tag {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('button');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Tag', () => {
  it('renders default dismissible tag accessibility and styling', async () => {
    const component = await renderTag({ content: 'Engineering' });

    expect(getRoot(component).props.accessibilityRole).toBe('button');
    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false });
    expect(component.getByText('Engineering')).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: '#fafafa',
      minHeight: 24,
      minWidth: 24,
    });
    expect(getRoot(component).children).toHaveLength(3);
  });

  it('forwards press and interaction handlers while updating background state', async () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderTag({ content: 'Engineering', onHoverIn, onPress });
    const root = getRoot(component);
    const restBackground = getRootStyle(component).backgroundColor;

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).not.toBe(restBackground);

    await fireEvent(root, 'pressIn', {});
    expect(onPress).not.toHaveBeenCalled();
    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderTag({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe('#f0f0f0');
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders icon and text layout with explicit icons and dismiss styling', async () => {
    const component = await renderTag({
      content: { children: 'Engineering', testID: 'content' },
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
    });

    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: 20, width: 20 });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: 16, width: 16 });
    expect(getRoot(component).children).toHaveLength(4);
  });

  it('renders icon-only layout with a required accessible label', async () => {
    const component = await renderTag({
      accessibilityLabel: 'Remove engineering filter',
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      layout: 'iconOnly',
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      size: 'small',
    });

    expect(getRoot(component).props.accessibilityLabel).toBe('Remove engineering filter');
    expect(component.queryByText('Tag text')).toBeNull();
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: 9999,
      paddingHorizontal: 4,
      paddingVertical: 4,
    });
    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: 16, width: 16 });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: 12, width: 12 });
  });

  it('warns when an icon-only tag has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderTag({
      layout: 'iconOnly',
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } },
    });

    expect(warn).toHaveBeenCalledWith('Tag: icon-only tags require an accessibilityLabel that describes the tag.');
    warn.mockRestore();
  });

  it('keeps foreground color stable while hover and pressed change background color', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderTag({ appearance: 'primary', content: 'Engineering' });
    const root = getRoot(component);
    const text = component.getByText('Engineering');
    const restForeground = StyleSheet.flatten(text.props.style).color;

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.backgroundBrandHeavy,
    });
    expect(restForeground).toBe(tokens.color.foregroundNeutralOnloud);

    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.hover.backgroundBrandHeavy,
    });
    expect(StyleSheet.flatten(text.props.style).color).toBe(tokens.color.foregroundNeutralOnloud);

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.pressed.backgroundBrandHeavy,
    });
    expect(StyleSheet.flatten(text.props.style).color).toBe(tokens.color.foregroundNeutralOnloud);
  });

  it('renders a persistent dual-ring focus visual', async () => {
    const component = await renderTag({ content: 'Focused' });
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

  it.each([
    ['primary', '#185abd'],
    ['secondary', '#fafafa'],
  ] as const)('resolves the %s appearance', async (appearance, backgroundColor) => {
    const component = await renderTag({ appearance, content: appearance });
    expect(getRootStyle(component).backgroundColor).toBe(backgroundColor);
  });

  it.each([
    ['small', 12, 16, 12],
    ['medium', 14, 20, 16],
  ] as const)('resolves the %s size', async (size, fontSize, leadingSize, dismissSize) => {
    const component = await renderTag({
      content: size,
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      size,
    });

    expect(StyleSheet.flatten(component.getByText(size).props.style)).toMatchObject({
      fontFamily: expect.any(String),
      fontSize,
    });
    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: leadingSize, width: leadingSize });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: dismissSize, width: dismissSize });
  });

  it.each([
    ['rounded', 4],
    ['circular', 9999],
  ] as const)('resolves the %s shape', async (shape, borderRadius) => {
    const component = await renderTag({ content: shape, shape });
    expect(getRootStyle(component).borderRadius).toBe(borderRadius);
  });

  it('renders a dismiss toggle and preserves user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderTag({
      content: { children: 'Tag text', testID: 'content' },
      dismiss: false,
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      style,
    });

    expect(component.queryByTestId('dismiss')).toBeNull();
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(getRoot(component).children).toHaveLength(3);
  });
});
