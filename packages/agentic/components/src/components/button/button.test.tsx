/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Pressable, PressableProps, ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { FlexThemeReference, ThemeProvider } from '@fluentui-react-native/design';
import { fluentTheme } from '@fluentui-react-native/design/themes';

import { Button } from './button';
import type { ButtonAppearance } from './button.types';

function renderButton(props: React.ComponentProps<typeof Button>): Promise<RenderResult> {
  return render(<Button {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('button');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Button', () => {
  it('lets theme base values override state-specific defaults and caller visuals override the theme', async () => {
    const theme = new FlexThemeReference({
      componentTokens: {
        'furn.button': { root: { backgroundColor: '#112233' }, content: { color: '#334455' }, icon: { width: 30, height: 31 } },
      },
    });
    const component = await render(
      <ThemeProvider theme={theme}>
        <Button
          appearance="primary"
          content={{ children: 'Save', style: { color: '#556677' } }}
          leadingIcon={{ imageSource: { uri: 'save.png' }, testID: 'icon', width: 40 }}
          style={{ minWidth: 75 }}
        />
      </ThemeProvider>,
    );
    expect(getRootStyle(component)).toMatchObject({ backgroundColor: '#112233', minWidth: 75 });
    expect(StyleSheet.flatten(component.getByText('Save').props.style)).toMatchObject({ color: '#556677' });
    expect(StyleSheet.flatten(component.getByTestId('icon').props.style)).toMatchObject({ width: 40, height: 31, tintColor: '#334455' });
  });

  it('forwards its ref prop to the native root', async () => {
    const ref = React.createRef<React.ElementRef<typeof Pressable>>();

    await renderButton({ content: 'Save', ref });

    expect(ref.current).not.toBeNull();
  });

  it('reuses cached theme styles without recreating them for another button instance', async () => {
    const createStyleSheet = jest.spyOn(StyleSheet, 'create');

    await renderButton({ content: 'First' });
    const createCount = createStyleSheet.mock.calls.length;
    await renderButton({ content: 'Second' });

    expect(createStyleSheet).toHaveBeenCalledTimes(createCount);
    createStyleSheet.mockRestore();
  });

  it('renders content with default button accessibility and secondary styling', async () => {
    const component = await renderButton({ content: 'Save' });
    const root = getRoot(component);

    expect(root.props.role).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(component.getByText('Save')).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: defaultFlexTokens.color.backgroundNeutralSubtle.rest,
      minHeight: 32,
      minWidth: 24,
    });
  });

  it('forwards press and interaction handlers while updating visual state', async () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderButton({ content: 'Save', onHoverIn, onPress });
    const root = getRoot(component);
    const restBackground = getRootStyle(component).backgroundColor;

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).not.toBe(restBackground);

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralSubtle.pressed);

    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Save', 'Save'],
    [0, '0'],
    [{ children: 'From slot' }, 'From slot'],
    [{ children: 0 }, '0'],
  ] as const)('projects plain content %j onto the native name', async (content, name) => {
    const component = await renderButton({ content });

    expect(getRoot(component).props.accessibilityLabel).toBe(name);
  });

  it.each([{ accessibilityLabel: 'Custom name' }, { 'aria-label': 'Custom name' }])(
    'preserves explicit native or ARIA naming %j',
    async (naming) => {
      const component = await renderButton({ content: 'Save', ...naming });

      expect(getRoot(component).props.accessibilityLabel).toBe('Custom name');
    },
  );

  it.each([{ accessibilityLabelledBy: 'external-label' }, { 'aria-labelledby': 'external-label' }])(
    'does not add a competing name for an explicit label reference %j',
    async (naming) => {
      const component = await renderButton({ content: 'Save', ...naming });

      expect(getRoot(component).props.accessibilityLabel).toBeUndefined();
    },
  );

  it('preserves an explicitly empty native label', async () => {
    const component = await renderButton({ content: 'Save', accessibilityLabel: '' });

    expect(getRoot(component).props.accessibilityLabel).toBe('');
  });

  it('does not infer a native name from rich content', async () => {
    const component = await renderButton({ content: { children: <View /> } });

    expect(getRoot(component).props.accessibilityLabel).toBeUndefined();
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderButton({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralSubtleDisabled.rest);
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders an accessible icon-only button at the minimum target size', async () => {
    const component = await renderButton({
      accessibilityLabel: 'Confirm',
      leadingIcon: { imageSource: { uri: 'confirm.png' }, testID: 'confirm-icon' },
      size: 'small',
    });
    const root = getRoot(component);
    const image = component.getByTestId('confirm-icon');

    expect(root.props.accessibilityLabel).toBe('Confirm');
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: defaultFlexTokens.borderRadius.base200,
      minHeight: 24,
      minWidth: 24,
      paddingHorizontal: 3,
      paddingVertical: 3,
    });
    expect(image.props.style).toMatchObject({ height: 16, width: 16 });
  });

  it('warns when an icon-only button has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderButton({ leadingIcon: { imageSource: { uri: 'confirm.png' } } });

    expect(warn).toHaveBeenCalledWith('Button: icon-only buttons require an accessibilityLabel that describes the action.');
    warn.mockRestore();
  });

  it('omits selection semantics when no selection prop is supplied', async () => {
    const component = await renderButton({ content: 'Action' });

    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false });
  });

  it('does not add a toggle action to an ordinary button', async () => {
    const actions = [{ name: 'custom', label: 'Details' }];
    const component = await renderButton({ content: 'Save', accessibilityActions: actions });

    expect(getRoot(component).props.accessibilityActions).toBe(actions);
    expect(getRoot(component).props['aria-checked']).toBeUndefined();
  });

  it('places the icon after content and applies user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderButton({
      content: { children: 'Next', testID: 'content' },
      leadingIcon: { imageSource: { uri: 'back.png' }, testID: 'leading' },
      trailingIcon: { imageSource: { uri: 'next.png' }, testID: 'icon' },
      style,
    });
    const root = getRoot(component);
    const content = component.getByTestId('content');
    const icon = component.getByTestId('icon');

    expect(root.children).toEqual([component.getByTestId('leading'), content, icon]);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderButton({ content: 'Focused' });
    const root = getRoot(component);

    expect(root.props.enableFocusRing).toBe(true);
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();

    await fireEvent(root, 'focus', {});

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it.each([
    ['primary', 'backgroundBrandHeavy'],
    ['secondary', 'backgroundNeutralSubtle'],
    ['outline', 'backgroundNeutralTransparent'],
    ['subtle', 'backgroundNeutralTransparent'],
  ] as const)('resolves the %s appearance', async (appearance, backgroundToken) => {
    const component = await renderButton({ appearance, content: appearance });
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color[backgroundToken].rest);
  });

  it.each([
    ['outline', defaultFlexTokens.color.strokeNeutralSubtle.rest],
    ['subtle', 'transparent'],
  ] as const)('resolves visible interaction feedback for the %s appearance', async (appearance, borderColor) => {
    const fill = defaultFlexTokens.color.backgroundNeutralTransparent;
    const component = await renderButton({ appearance, content: appearance });
    const root = getRoot(component);

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: fill.rest,
      borderColor,
    });

    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: fill.hover,
      borderColor,
    });

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: fill.pressed,
      borderColor,
    });
  });

  it('allows constrained content to wrap', async () => {
    const component = await renderButton({
      content: { children: 'Long button content', testID: 'content' },
      style: { width: 120 },
    });

    const content = component.getByTestId('content');

    expect(content.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ flexShrink: 1 });
  });

  it('preserves visible Subtle hover feedback in the Fluent fallback theme', async () => {
    const component = await render(
      <ThemeProvider theme={fluentTheme}>
        <Button appearance="subtle" content="Act" />
      </ThemeProvider>,
    );
    const before = getRootStyle(component).backgroundColor;
    await fireEvent(getRoot(component), 'hoverIn', {});
    expect(getRootStyle(component).backgroundColor).not.toBe(before);
    expect(getRootStyle(component).borderColor).toBe('transparent');
  });

  it.each([
    ['small', 12, 8, defaultFlexTokens.borderRadius.base200],
    ['medium', 14, 10, defaultFlexTokens.borderRadius.base300],
    ['large', 16, 12, defaultFlexTokens.borderRadius.base400],
  ] as const)('resolves the %s size', async (size, fontSize, paddingHorizontal, borderRadius) => {
    const component = await renderButton({ content: size, size });
    expect(StyleSheet.flatten(component.getByText(size).props.style)).toMatchObject({
      fontFamily: expect.any(String),
      fontSize,
    });
    expect(getRootStyle(component).paddingHorizontal).toBe(paddingHorizontal - defaultFlexTokens.strokeWidth.thin);
    expect(getRootStyle(component).borderRadius).toBe(borderRadius);
  });

  it('preserves user accessibility state values', async () => {
    const props: Pick<PressableProps, 'accessibilityState'> = {
      accessibilityState: { busy: true },
    };
    const component = await renderButton({ content: 'Working', ...props });
    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false });
  });

  const appearances: ButtonAppearance[] = ['primary', 'secondary', 'outline', 'subtle'];
  const visualStates = ['rest', 'hovered', 'pressed', 'focused', 'disabled'] as const;

  it.each(visualStates)('matches the %s visual state snapshot across appearances', async (visualState) => {
    const disabled = visualState === 'disabled';
    const component = await render(
      <View>
        {appearances.map((appearance) => (
          <Button key={appearance} appearance={appearance} content={appearance} disabled={disabled} />
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
      contentStyles: component
        .getAllByText(appearances[index], { includeHiddenElements: true })
        .map((content) => StyleSheet.flatten(content.props.style)),
      rootStyle: StyleSheet.flatten(button.props.style),
    }));

    expect(visualSnapshot).toMatchSnapshot();
  });
});
