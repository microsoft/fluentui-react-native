/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Radio } from './radio';

function renderRadio(props: ComponentProps<typeof Radio>): Promise<RenderResult> {
  return render(<Radio {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('radio');
}

function getRootStyle(component: RenderResult) {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getText(component: RenderResult, text: string) {
  return component.getByText(text, { includeHiddenElements: true });
}

function getTestId(component: RenderResult, testID: string) {
  return component.getByTestId(testID, { includeHiddenElements: true });
}

describe('Radio', () => {
  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderRadio({ onPress, selected: false });

    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState.checked).toBe(false);
  });

  it('renders the default label and accessibility state', async () => {
    const component = await renderRadio({});
    const root = getRoot(component);

    expect(root.props.accessibilityLabel).toBe('Label');
    expect(root.props.accessibilityState).toEqual({ checked: false, selected: false, disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(getText(component, 'Label')).toBeOnTheScreen();
    expect(component.queryByText('Description')).toBeNull();
  });

  it('shows secondary text and uses it as accessibility hint when visible', async () => {
    const component = await renderRadio({ label: 'Mail', secondaryText: 'Saves your selection', showSecondaryText: true });
    const root = getRoot(component);

    expect(root.props.accessibilityLabel).toBe('Mail');
    expect(root.props.accessibilityHint).toBe('Saves your selection');
    expect(getText(component, 'Saves your selection')).toBeOnTheScreen();
  });

  it('resolves unselected colors and layout tokens', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderRadio({ label: 'Choice' });

    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderRadius: tokens.borderRadius.base300,
      gap: tokens.spacing.componentBase100,
    });
    expect(StyleSheet.flatten(getTestId(component, 'radio-indicator').props.style)).toMatchObject({
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderColor: tokens.color.strokeNeutralHeavy,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      height: 16,
      width: 16,
    });
    expect(StyleSheet.flatten(getTestId(component, 'radio-dot').props.style)).toMatchObject({
      backgroundColor: tokens.color.foregroundBrandPrimary,
      height: 10,
      opacity: 0,
      width: 10,
    });
    expect(StyleSheet.flatten(getText(component, 'Choice').props.style)).toMatchObject({
      color: tokens.color.foregroundNeutralSecondary,
      fontSize: expect.any(Number),
    });
  });

  it('resolves selected colors and exposes checked accessibility state', async () => {
    const tokens = defaultFlexTokens.color;
    const component = await renderRadio({ label: 'Choice', selected: true });
    const root = getRoot(component);

    expect(root.props.accessibilityState).toEqual({ checked: true, selected: true, disabled: false });
    expect(StyleSheet.flatten(getTestId(component, 'radio-indicator').props.style).borderColor).toBe(tokens.strokeBrandLoud);
    expect(StyleSheet.flatten(getTestId(component, 'radio-dot').props.style)).toMatchObject({
      backgroundColor: tokens.foregroundBrandPrimary,
      opacity: 1,
    });
    expect(StyleSheet.flatten(getText(component, 'Choice').props.style).color).toBe(tokens.foregroundNeutralPrimary);
  });

  it('updates interaction colors on hover and press', async () => {
    const tokens = defaultFlexTokens.color;
    const component = await renderRadio({ label: 'Choice' });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(StyleSheet.flatten(getTestId(component, 'radio-indicator').props.style).borderColor).toBe(tokens.hover.strokeNeutralHeavy);
    expect(StyleSheet.flatten(getText(component, 'Choice').props.style).color).toBe(tokens.hover.foregroundNeutralSecondary);

    await fireEvent(root, 'pressIn', {});
    expect(StyleSheet.flatten(getTestId(component, 'radio-indicator').props.style).borderColor).toBe(tokens.pressed.strokeNeutralHeavy);
    expect(StyleSheet.flatten(getText(component, 'Choice').props.style).color).toBe(tokens.pressed.foregroundNeutralSecondary);
  });

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderRadio({ label: 'Choice' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it('disables interaction and preserves unrelated accessibility state', async () => {
    const component = await renderRadio({ accessibilityState: { busy: true }, disabled: true, label: 'Choice' });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ busy: true, checked: false, selected: false, disabled: true });
  });

  it('applies user styles last and allows constrained labels to shrink', async () => {
    const component = await renderRadio({
      label: 'A long option label that needs room to wrap when the control is constrained',
      style: { backgroundColor: 'hotpink', width: 120 },
    });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(
      StyleSheet.flatten(getText(component, 'A long option label that needs room to wrap when the control is constrained').props.style),
    ).toMatchObject({
      flexShrink: 1,
    });
  });

  it('explicitly hides decorative descendants from accessibility', async () => {
    const component = await renderRadio({ label: 'Choice', secondaryText: 'Description', showSecondaryText: true });
    const indicator = getTestId(component, 'radio-indicator');
    const label = getText(component, 'Choice');

    expect(indicator.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(label.parent?.props).toMatchObject({
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  it.each([
    ['win32', 'Select'],
    ['windows', 'select'],
    ['macos', 'Select'],
  ] as const)('declares the native selection action on %s', async (platform, actionName) => {
    const replacement = jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    try {
      const component = await renderRadio({});
      expect(getRoot(component).props.accessibilityActions).toEqual([{ name: actionName }]);
    } finally {
      replacement.restore();
    }
  });

  it('preserves caller action labels and deduplicates selection declarations', async () => {
    const component = await renderRadio({
      accessibilityActions: [{ name: 'Select', label: 'Choose option' }, { name: 'Select' }, { name: 'custom' }],
    });
    expect(getRoot(component).props.accessibilityActions).toEqual([{ name: 'Select', label: 'Choose option' }, { name: 'custom' }]);
  });

  it.each([false, true])('owns native checked and selection state when selected is %s', async (selected) => {
    const component = await renderRadio({
      selected,
      accessibilityState: { busy: true, checked: !selected, selected: !selected },
      'aria-checked': !selected,
      'aria-selected': !selected,
    });
    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, checked: selected, selected, disabled: false });
  });

  it.each([false, true])('forwards the original native action without pressing or selecting when disabled is %s', async (disabled) => {
    const onAccessibilityAction = jest.fn();
    const onPress = jest.fn();
    const component = await renderRadio({ disabled, selected: false, onAccessibilityAction, onPress });
    const event = { nativeEvent: { actionName: 'Select' } };
    getRoot(component).props.onAccessibilityAction(event);
    expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
    expect(onAccessibilityAction).toHaveBeenCalledWith(event);
    expect(onPress).not.toHaveBeenCalled();
    expect(getRoot(component).props.accessibilityState).toMatchObject({ checked: false, selected: false });
  });
});
