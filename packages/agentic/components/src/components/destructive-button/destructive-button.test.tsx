/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Pressable, PressableProps, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { DestructiveButton } from './destructive-button';
import type { DestructiveButtonAppearance } from './destructive-button.types';

function renderDestructiveButton(props: React.ComponentProps<typeof DestructiveButton>): Promise<RenderResult> {
  return render(<DestructiveButton {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('button');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

const colors = defaultFlexTokens.color;

describe('DestructiveButton', () => {
  it('forwards its ref prop to the native root', async () => {
    const ref = React.createRef<React.ElementRef<typeof Pressable>>();

    await renderDestructiveButton({ content: 'Delete', ref });

    expect(ref.current).not.toBeNull();
  });

  it('reuses cached theme styles without recreating them for another instance', async () => {
    const createStyleSheet = jest.spyOn(StyleSheet, 'create');

    await renderDestructiveButton({ content: 'First' });
    const createCount = createStyleSheet.mock.calls.length;
    await renderDestructiveButton({ content: 'Second' });

    expect(createStyleSheet).toHaveBeenCalledTimes(createCount);
    createStyleSheet.mockRestore();
  });

  it('renders content with default button accessibility and primary danger styling', async () => {
    const component = await renderDestructiveButton({ content: 'Delete' });
    const root = getRoot(component);

    expect(root.props.role).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(component.getByText('Delete')).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: colors.backgroundDangerLoud,
      borderRadius: 4,
      minHeight: 24,
      minWidth: 24,
    });
    expect(StyleSheet.flatten(component.getByText('Delete').props.style).color).toBe(colors.foregroundDangerOnloud);
  });

  it('forwards press and interaction handlers', async () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderDestructiveButton({ content: 'Delete', onHoverIn, onPress });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);

    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderDestructiveButton({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralHeavyDisabled);
    expect(StyleSheet.flatten(component.getByText('Unavailable').props.style).color).toBe(colors.foregroundNeutralDisabled);
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps a disabled button out of the tab order when focusable is requested', async () => {
    const component = await renderDestructiveButton({ content: 'Unavailable', disabled: true, focusable: true });

    expect(getRoot(component).props.focusable).toBe(false);
  });

  it('renders an accessible icon-only button at the minimum target size', async () => {
    const component = await renderDestructiveButton({
      accessibilityLabel: 'Delete item',
      icon: { imageSource: { uri: 'delete.png' }, testID: 'delete-icon' },
      size: 'small',
    });
    const root = getRoot(component);
    const image = component.getByTestId('delete-icon');

    expect(root.props.accessibilityLabel).toBe('Delete item');
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: 9999,
      minHeight: 24,
      minWidth: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
    });
    expect(image.props.style).toMatchObject({ height: 16, width: 16 });
    expect(image.props.accessible).toBe(false);
  });

  it('warns when an icon-only button has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderDestructiveButton({ icon: { imageSource: { uri: 'delete.png' } } });

    expect(warn).toHaveBeenCalledWith('DestructiveButton: icon-only buttons require an accessibilityLabel that describes the action.');
    warn.mockRestore();
  });

  it.each(['', '   ', { children: null }])('treats empty content as icon-only content', async (content) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderDestructiveButton({
      content,
      icon: { imageSource: { uri: 'delete.png' } },
    });

    expect(getRootStyle(component).borderRadius).toBe(9999);
    expect(warn).toHaveBeenCalledWith('DestructiveButton: icon-only buttons require an accessibilityLabel that describes the action.');
    warn.mockRestore();
  });

  it('never reports selection state and does not gain it on press', async () => {
    const onPress = jest.fn();
    const component = await renderDestructiveButton({ content: 'Delete', onPress });
    const root = getRoot(component);

    expect(root.props.accessibilityState).toEqual({ disabled: false });

    await fireEvent.press(root);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false });
    expect(component.getAllByText('Delete', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('removes caller-supplied selection semantics while retaining other accessibility state', async () => {
    const component = await renderDestructiveButton({
      'aria-checked': true,
      'aria-selected': true,
      accessibilityState: { busy: true, checked: true, selected: true },
      content: 'Delete',
    });
    const root = getRoot(component);

    expect(root.props['aria-checked']).toBeUndefined();
    expect(root.props['aria-selected']).toBeUndefined();
    expect(root.props.accessibilityState).toEqual({ busy: true, disabled: false });
  });

  it('places the icon after content and applies user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderDestructiveButton({
      content: { children: 'Delete', testID: 'content' },
      icon: { imageSource: { uri: 'delete.png' }, testID: 'icon' },
      iconPosition: 'after',
      style,
    });
    const root = getRoot(component);
    const content = component.getByTestId('content');
    const icon = component.getByTestId('icon');

    expect(root.children.slice(1)).toEqual([content, icon]);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('renders a persistent dual-ring focus visual', async () => {
    const component = await renderDestructiveButton({ content: 'Delete' });
    const root = getRoot(component);
    const focusVisual = () => component.getByTestId('focus-visual', { includeHiddenElements: true });

    expect(root.props.enableFocusRing).toBe(false);
    expect(StyleSheet.flatten(focusVisual().props.style).opacity).toBe(0);

    await fireEvent(root, 'focus', {});

    expect(StyleSheet.flatten(focusVisual().props.style)).toMatchObject({
      borderColor: colors.strokeFocusOuter,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(focusVisual().props.style)).not.toHaveProperty('opacity');
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: colors.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
  });

  it('hides the focus visual while disabled', async () => {
    const component = await renderDestructiveButton({ content: 'Delete', disabled: true });

    await fireEvent(getRoot(component), 'focus', {});

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style).opacity).toBe(0);
  });

  it.each([
    ['primary', 'backgroundDangerLoud', 'foregroundDangerOnloud'],
    ['subtle', 'backgroundNeutralTransparent', 'foregroundDangerPrimary'],
  ] as const)('resolves the %s appearance from the danger token family', async (appearance, background, foreground) => {
    const component = await renderDestructiveButton({ appearance, content: appearance });

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors[background],
      // Neither appearance draws a stroke; DestructiveButton has no outline emphasis level.
      borderColor: colors.strokeNeutralTransparent,
    });
    expect(StyleSheet.flatten(component.getByText(appearance).props.style).color).toBe(colors[foreground]);
  });

  it('reveals a danger tint when the subtle appearance is hovered or pressed', async () => {
    const component = await renderDestructiveButton({ appearance: 'subtle', content: 'Remove' });
    const root = getRoot(component);

    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralTransparent);

    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.hover.backgroundDangerSubtle);

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.pressed.backgroundDangerSubtle);
  });

  it('resolves the danger loud interaction backgrounds the theme currently supplies', async () => {
    const component = await renderDestructiveButton({ appearance: 'primary', content: 'Delete' });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.hover.backgroundDangerLoud);

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(colors.pressed.backgroundDangerLoud);
  });

  it('keeps disabled above pressed and hovered in state precedence', async () => {
    const component = await renderDestructiveButton({ content: 'Delete', disabled: true });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    await fireEvent(root, 'pressIn', {});

    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralHeavyDisabled);
  });

  it('allows constrained content to wrap', async () => {
    const component = await renderDestructiveButton({
      content: { children: 'Delete every selected item', testID: 'content' },
      style: { width: 120 },
    });
    const content = component.getByTestId('content');

    expect(content.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ flexShrink: 1 });
  });

  it.each([
    ['small', 12, 8, 4, 16],
    ['medium', 14, 10, 4, 20],
    ['large', 16, 12, 6, 20],
  ] as const)('resolves the %s size', async (size, fontSize, paddingHorizontal, borderRadius, iconSize) => {
    const component = await renderDestructiveButton({
      content: size,
      icon: { imageSource: { uri: 'delete.png' }, testID: 'icon' },
      size,
    });

    expect(StyleSheet.flatten(component.getByText(size).props.style)).toMatchObject({
      fontFamily: expect.any(String),
      fontSize,
      fontWeight: defaultFlexTokens.fontWeight.functionalRegular,
    });
    expect(getRootStyle(component).paddingHorizontal).toBe(paddingHorizontal);
    expect(getRootStyle(component).borderRadius).toBe(borderRadius);
    expect(component.getByTestId('icon').props.style).toMatchObject({ height: iconSize, width: iconSize });
  });

  it.each([
    ['rounded', 4],
    ['circle', 9999],
  ] as const)('applies an explicit %s shape', async (shape, borderRadius) => {
    const component = await renderDestructiveButton({ content: shape, shape });
    expect(getRootStyle(component).borderRadius).toBe(borderRadius);
  });

  it('preserves user accessibility state values', async () => {
    const props: Pick<PressableProps, 'accessibilityState'> = {
      accessibilityState: { busy: true },
    };
    const component = await renderDestructiveButton({ content: 'Deleting', ...props });
    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false });
  });

  const appearances: DestructiveButtonAppearance[] = ['primary', 'subtle'];
  const visualStates = ['rest', 'hovered', 'pressed', 'focused', 'disabled'] as const;

  it.each(visualStates)('matches the %s visual state snapshot across appearances', async (visualState) => {
    const disabled = visualState === 'disabled';
    const component = await render(
      <View>
        {appearances.map((appearance) => (
          <DestructiveButton key={appearance} appearance={appearance} content={appearance} disabled={disabled} />
        ))}
      </View>,
    );

    if (visualState === 'hovered' || visualState === 'pressed' || visualState === 'focused') {
      const eventName = visualState === 'hovered' ? 'hoverIn' : visualState === 'pressed' ? 'pressIn' : 'focus';
      for (const button of component.getAllByRole('button')) {
        await fireEvent(button, eventName, {});
      }
    }

    const visualSnapshot = component.getAllByRole('button').map((button, index) => ({
      appearance: appearances[index],
      contentStyle: StyleSheet.flatten(component.getByText(appearances[index]).props.style),
      rootStyle: StyleSheet.flatten(button.props.style),
    }));

    expect(visualSnapshot).toMatchSnapshot();
  });
});
