/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

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

    expect(root.props.accessibilityRole).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(component.getByText('Save')).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: '#fafafa',
      minHeight: 24,
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
    expect(getRootStyle(component).backgroundColor).toBe('#dbdbdb');

    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderButton({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe('#f0f0f0');
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders an accessible icon-only button at the minimum target size', async () => {
    const component = await renderButton({
      accessibilityLabel: 'Confirm',
      icon: { imageSource: { uri: 'confirm.png' }, testID: 'confirm-icon' },
      size: 'small',
    });
    const root = getRoot(component);
    const image = component.getByTestId('confirm-icon');

    expect(root.props.accessibilityLabel).toBe('Confirm');
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: 9999,
      minHeight: 24,
      minWidth: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
    });
    expect(image.props.style).toMatchObject({ height: 16, width: 16 });
  });

  it('warns when an icon-only button has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderButton({ icon: { imageSource: { uri: 'confirm.png' } } });

    expect(warn).toHaveBeenCalledWith('Button: icon-only buttons require an accessibilityLabel that describes the action.');
    warn.mockRestore();
  });

  it('uses the regular icon while a toggle button is not selected', async () => {
    const component = await renderButton({
      accessibilityLabel: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      selected: false,
      selectedIcon: { imageSource: { uri: 'filled.png' }, testID: 'filled-icon' },
    });

    expect(component.getByTestId('regular-icon').props.source).toEqual({ uri: 'regular.png' });
    expect(component.queryByTestId('filled-icon')).toBeNull();
  });

  it('uses selected semantics, selected icon, and a ghost label to prevent reflow', async () => {
    const component = await renderButton({
      content: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      selected: true,
      selectedIcon: { imageSource: { uri: 'filled.png' }, testID: 'filled-icon' },
    });
    const root = getRoot(component);
    const labels = component.getAllByText('Favorite', { includeHiddenElements: true });

    expect(root.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(component.getByTestId('filled-icon').props.source).toEqual({ uri: 'filled.png' });
    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({ fontWeight: '600', opacity: 0 });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({ fontWeight: '600', position: 'absolute' });
  });

  it('toggles its own selection when selection is internally driven', async () => {
    const onSelectedChange = jest.fn();
    const onPress = jest.fn();
    const component = await renderButton({ content: 'Favorite', defaultSelected: false, onPress, onSelectedChange });

    expect(getRoot(component).props.accessibilityState.checked).toBe(false);

    await fireEvent.press(getRoot(component));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState.checked).toBe(true);

    await fireEvent.press(getRoot(component));

    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(getRoot(component).props.accessibilityState.checked).toBe(false);
  });

  it('reports presses without changing state when selection is externally driven', async () => {
    const onSelectedChange = jest.fn();
    const component = await renderButton({ content: 'Favorite', onSelectedChange, selected: false });

    await fireEvent.press(getRoot(component));

    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(getRoot(component).props.accessibilityState.checked).toBe(false);
  });

  it('enables toggle semantics from onSelectedChange alone and never toggles while disabled', async () => {
    const onSelectedChange = jest.fn();
    const component = await renderButton({ content: 'Favorite', onSelectedChange });

    expect(getRoot(component).props.accessibilityState.checked).toBe(false);

    const disabled = await renderButton({ content: 'Favorite', defaultSelected: false, disabled: true, onSelectedChange });
    await fireEvent.press(disabled.getByRole('button'));

    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  it('omits selection semantics when no selection prop is supplied', async () => {
    const component = await renderButton({ content: 'Action' });

    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false });
  });

  it('places the icon after content and applies user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderButton({
      content: { children: 'Next', testID: 'content' },
      icon: { imageSource: { uri: 'next.png' }, testID: 'icon' },
      iconPosition: 'after',
      style,
    });
    const root = getRoot(component);
    const content = component.getByTestId('content');
    const icon = component.getByTestId('icon');

    expect(root.children).toEqual([content, icon]);
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('renders a dual-token focus outline', async () => {
    const component = await renderButton({ content: 'Focused' });
    const root = getRoot(component);
    await fireEvent(root, 'focus', {});

    expect(getRootStyle(component)).toMatchObject({
      borderColor: '#ffffff',
      outlineColor: '#000000',
      outlineOffset: 1,
      outlineStyle: 'solid',
      outlineWidth: 2,
    });
  });

  it.each([
    ['primary', '#185abd'],
    ['secondary', '#fafafa'],
    ['outline', '#00000000'],
    ['subtle', '#00000000'],
  ] as const)('resolves the %s appearance', async (appearance, backgroundColor) => {
    const component = await renderButton({ appearance, content: appearance });
    expect(getRootStyle(component).backgroundColor).toBe(backgroundColor);
  });

  it.each([
    ['outline', 'backgroundNeutralTransparent', 'strokeNeutralLoud', 'backgroundNeutralTransparent', 'strokeNeutralLoud'],
    ['subtle', 'backgroundNeutralTransparent', 'strokeNeutralTransparent', 'backgroundNeutralSubtle', 'strokeNeutralTransparent'],
  ] as const)(
    'resolves visible interaction feedback for the %s appearance',
    async (appearance, restBackground, restBorder, interactionBackground, interactionBorder) => {
      const colors = useFlexTokens().color;
      const component = await renderButton({ appearance, content: appearance });
      const root = getRoot(component);

      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors[restBackground],
        borderColor: colors[restBorder],
      });

      await fireEvent(root, 'hoverIn', {});
      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors.hover[interactionBackground],
        borderColor: colors.hover[interactionBorder],
      });

      await fireEvent(root, 'pressIn', {});
      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors.pressed[interactionBackground],
        borderColor: colors.pressed[interactionBorder],
      });
    },
  );

  it('allows constrained content to wrap', async () => {
    const component = await renderButton({
      content: { children: 'Long button content', testID: 'content' },
      style: { width: 120 },
    });
    const content = component.getByTestId('content');

    expect(content.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ flexShrink: 1 });
  });

  it.each([
    [
      'primary',
      'backgroundBrandHeavy',
      'strokeNeutralTransparent',
      'foregroundBrandOnloud',
      'backgroundNeutralHeavyDisabled',
      'strokeNeutralTransparent',
    ],
    [
      'secondary',
      'backgroundNeutralHeavy',
      'strokeNeutralTransparent',
      'foregroundNeutralOnloud',
      'backgroundNeutralHeavyDisabled',
      'strokeNeutralTransparent',
    ],
    [
      'outline',
      'backgroundNeutralHeavy',
      'strokeNeutralHeavy',
      'foregroundNeutralOnloud',
      'backgroundNeutralHeavyDisabled',
      'strokeNeutralDisabled',
    ],
    [
      'subtle',
      'backgroundNeutralSoft',
      'strokeNeutralTransparent',
      'foregroundNeutralPrimary',
      'backgroundNeutralSubtleDisabled',
      'strokeNeutralTransparent',
    ],
  ] as const)(
    'resolves selected %s colors by interaction state',
    async (appearance, background, border, foreground, disabledBackground, disabledBorder) => {
      const colors = useFlexTokens().color;
      const component = await renderButton({ appearance, content: appearance, selected: true });
      const root = getRoot(component);
      const getForegroundColor = () =>
        StyleSheet.flatten(component.getAllByText(appearance, { includeHiddenElements: true })[1].props.style).color;

      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors[background],
        borderColor: colors[border],
      });
      expect(getForegroundColor()).toBe(colors[foreground]);

      await fireEvent(root, 'hoverIn', {});
      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors.hover[background],
        borderColor: colors.hover[border],
      });
      expect(getForegroundColor()).toBe(colors.hover[foreground]);

      await fireEvent(root, 'pressIn', {});
      expect(getRootStyle(component)).toMatchObject({
        backgroundColor: colors.pressed[background],
        borderColor: colors.pressed[border],
      });
      expect(getForegroundColor()).toBe(colors.pressed[foreground]);

      const disabledComponent = await renderButton({ appearance, content: appearance, disabled: true, selected: true });
      expect(getRootStyle(disabledComponent)).toMatchObject({
        backgroundColor: colors[disabledBackground],
        borderColor: colors[disabledBorder],
      });
      expect(StyleSheet.flatten(disabledComponent.getAllByText(appearance, { includeHiddenElements: true })[1].props.style).color).toBe(
        colors.foregroundNeutralDisabled,
      );
    },
  );

  it.each([
    ['small', 12, 8, 4],
    ['medium', 14, 10, 4],
    ['large', 16, 12, 6],
  ] as const)('resolves the %s size', async (size, fontSize, paddingHorizontal, borderRadius) => {
    const component = await renderButton({ content: size, size });
    expect(StyleSheet.flatten(component.getByText(size).props.style)).toMatchObject({
      fontFamily: expect.any(String),
      fontSize,
    });
    expect(getRootStyle(component).paddingHorizontal).toBe(paddingHorizontal);
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
  const visualStates = ['rest', 'hovered', 'pressed', 'focused', 'disabled', 'selected'] as const;

  it.each(visualStates)('matches the %s visual state snapshot across appearances', async (visualState) => {
    const disabled = visualState === 'disabled';
    const selected = visualState === 'selected';
    const component = await render(
      <View>
        {appearances.map((appearance) => (
          <Button
            key={appearance}
            appearance={appearance}
            content={appearance}
            disabled={disabled}
            selected={selected ? true : undefined}
          />
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
