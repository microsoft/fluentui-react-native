/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text, View } from 'react-native';
import type { TextProps, ViewProps } from 'react-native';
import type { ComponentProps } from 'react';

import { act, fireEvent, render } from '@testing-library/react-native';

import { defaultFlexTokens, defaultResolvedThemeAppearance } from '@fluentui-react-native/design/testing';
import { directComponent } from '@fluentui-react-native/framework-base';

import { Switch } from './switch';
import { getSwitchThumbTranslateDistance, getSwitchThumbColorStyle, getSwitchTrackColorStyle } from './switch.styles';
import type { SwitchState } from './switch.types';

const ReplacementTrack = directComponent<ViewProps>((props) => <View {...props} testID={props.testID ?? 'replacement-track'} />);
const ReplacementLabel = directComponent<TextProps>((props) => <Text {...props} testID={props.testID ?? 'replacement-label'} />);

function renderSwitch(props: ComponentProps<typeof Switch> = {}) {
  return render(<Switch {...props} />);
}

async function flushAnimationFrame() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
}

describe('Switch', () => {
  it('renders a labeled switch with default unchecked semantics', async () => {
    const component = await renderSwitch({ label: 'Wi-Fi', labelAfter: false });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    expect(root.props.role).toBe('switch');
    expect(root.props.accessibilityState).toEqual({ checked: false, disabled: false });
    expect(root.props.accessibilityLabelledBy).toBeUndefined();
    expect(root.props['aria-labelledby']).toBeUndefined();
    expect(root.props.focusable).toBe(true);
  });

  it('toggles on press and calls onChange', async () => {
    const onChange = jest.fn();
    const component = await renderSwitch({ label: 'Wi-Fi', labelAfter: false, onChange });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    await fireEvent.press(root);
    await flushAnimationFrame();

    expect(onChange).toHaveBeenCalledWith(true);
    expect(component.getByRole('switch', { name: 'Wi-Fi' }).props.accessibilityState.checked).toBe(true);
  });

  it('reports presses without changing state when the checked value is externally driven', async () => {
    const onChange = jest.fn();
    const component = await renderSwitch({ checked: false, label: 'Wi-Fi', labelAfter: false, onChange });

    await fireEvent.press(component.getByRole('switch', { name: 'Wi-Fi' }));
    await flushAnimationFrame();

    expect(onChange).toHaveBeenCalledWith(true);
    expect(component.getByRole('switch', { name: 'Wi-Fi' }).props.accessibilityState.checked).toBe(false);
  });

  it('starts from defaultChecked and forwards the user press handler', async () => {
    const onChange = jest.fn();
    const onPress = jest.fn();
    const component = await renderSwitch({ defaultChecked: true, label: 'Wi-Fi', labelAfter: false, onChange, onPress });

    expect(component.getByRole('switch', { name: 'Wi-Fi' }).props.accessibilityState.checked).toBe(true);

    await fireEvent.press(component.getByRole('switch', { name: 'Wi-Fi' }));
    await flushAnimationFrame();

    expect(onChange).toHaveBeenCalledWith(false);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(component.getByRole('switch', { name: 'Wi-Fi' }).props.accessibilityState.checked).toBe(false);
  });

  it('toggles on Enter and Space', async () => {
    const onChange = jest.fn();
    const component = await renderSwitch({ accessibilityLabel: 'Wi-Fi', layout: 'switch', onChange });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    await fireEvent(root, 'keyUp', { nativeEvent: { key: 'Enter' } });
    await flushAnimationFrame();
    await fireEvent(root, 'keyUp', { nativeEvent: { key: ' ' } });
    await flushAnimationFrame();

    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });

  it('forwards hover and press handlers while preserving consumer accessibility state', async () => {
    const onHoverIn = jest.fn();
    const onPressIn = jest.fn();
    const component = await renderSwitch({
      accessibilityState: { busy: true },
      label: 'Wi-Fi',
      labelAfter: false,
      onHoverIn,
      onPressIn,
    });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    await fireEvent(root, 'hoverIn', {});
    await fireEvent(root, 'pressIn', {});

    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(root.props.accessibilityState).toEqual({ busy: true, checked: false, disabled: false });
  });

  it('disables interaction and focusability', async () => {
    const onChange = jest.fn();
    const component = await renderSwitch({ accessibilityLabel: 'Wi-Fi', disabled: true, layout: 'switch', onChange });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    await fireEvent.press(root);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the persistent dual-ring focus visual on the hit area', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderSwitch({ label: 'Wi-Fi', labelAfter: false });
    const root = component.getByRole('switch', { name: 'Wi-Fi' });

    await fireEvent(root, 'focus', {});

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: tokens.color.strokeFocusOuter,
      borderWidth: tokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: tokens.color.strokeFocusInner,
      borderWidth: tokens.strokeWidth.thin,
    });
  });

  it('positions labels according to layout', async () => {
    const horizontal = await renderSwitch({ afterLabel: false, label: 'Wi-Fi', labelBefore: true, layout: 'horizontal' });
    const horizontalContainer = horizontal.getByTestId('switch-layout-container');
    const horizontalChildren = horizontalContainer.children as { props: { role?: string; children?: unknown } }[];

    expect(horizontalChildren[0].props.children).toBe('Wi-Fi');
    expect(horizontalChildren[1].props.role).toBe('switch');

    const vertical = await renderSwitch({ label: 'Wi-Fi', layout: 'vertical' });
    const verticalContainer = vertical.getByTestId('switch-layout-container');
    const verticalChildren = verticalContainer.children as { props: { role?: string; children?: unknown } }[];

    expect(verticalChildren[0].props.children).toBe('Wi-Fi');
    expect(verticalChildren[1].props.role).toBe('switch');
  });

  it('supports a standalone switch accessibility label', async () => {
    const component = await renderSwitch({ accessibilityLabel: 'Wi-Fi', layout: 'switch' });

    expect(component.getByRole('switch', { name: 'Wi-Fi' })).toBeOnTheScreen();
    expect(component.queryByText('Wi-Fi')).toBeNull();
  });

  it('supports slot replacement for the track and labels', async () => {
    const component = await renderSwitch({
      afterLabel: false,
      beforeLabel: { as: ReplacementLabel, children: 'Wi-Fi', testID: 'replacement-label' },
      label: 'Wi-Fi',
      layout: 'horizontal',
      track: { as: ReplacementTrack, testID: 'replacement-track' },
    });

    expect(component.getByTestId('replacement-track')).toBeOnTheScreen();
    expect(component.getByTestId('replacement-label')).toBeOnTheScreen();
  });

  it.each([
    ['unchecked rest', false, false, false, false],
    ['unchecked hover', false, false, true, false],
    ['unchecked pressed', false, false, false, true],
    ['checked rest', true, false, false, false],
    ['checked hover', true, false, true, false],
    ['checked pressed', true, false, false, true],
    ['disabled unchecked', false, true, false, false],
    ['disabled checked', true, true, false, false],
  ] as const)('resolves switch token colors for %s', async (_label, checked, disabled, hovered, pressed) => {
    const tokens = defaultFlexTokens;
    const colors = tokens.color;
    const state = {
      checked,
      disabled,
      hovered,
      pressed,
      appearance: defaultResolvedThemeAppearance,
      highContrast: false,
      themeStyles: {},
      tokens,
    } as SwitchState;
    const baseBackgroundKey = checked ? 'backgroundNeutralHeavy' : 'backgroundNeutralTransparent';
    const baseBorderKey = checked ? 'strokeNeutralHeavy' : 'foregroundNeutralSecondary';
    const baseThumbKey = checked ? 'foregroundNeutralOnloud' : 'foregroundNeutralSecondary';
    const expectedTrackBackground = disabled
      ? checked
        ? colors.backgroundNeutralHeavyDisabled
        : colors.backgroundNeutralTransparent
      : pressed
        ? colors.pressed[baseBackgroundKey]
        : hovered
          ? colors.hover[baseBackgroundKey]
          : colors[baseBackgroundKey];
    const expectedTrackBorder = disabled
      ? colors.strokeNeutralDisabled
      : pressed
        ? colors.pressed[baseBorderKey]
        : hovered
          ? colors.hover[baseBorderKey]
          : colors[baseBorderKey];
    const expectedThumb = disabled
      ? colors.foregroundNeutralDisabled
      : pressed
        ? colors.pressed[baseThumbKey]
        : hovered
          ? colors.hover[baseThumbKey]
          : colors[baseThumbKey];

    const resolvedTrack = getSwitchTrackColorStyle(state, checked);
    const resolvedThumb = getSwitchThumbColorStyle(state, checked);

    expect(resolvedTrack.backgroundColor).toBe(expectedTrackBackground);
    expect(resolvedTrack.borderColor).toBe(expectedTrackBorder);
    expect(resolvedThumb.backgroundColor).toBe(expectedThumb);
  });

  it('uses the documented thumb translation distance', () => {
    const tokens = defaultFlexTokens;

    expect(getSwitchThumbTranslateDistance({ tokens })).toBe(20);
  });
});
