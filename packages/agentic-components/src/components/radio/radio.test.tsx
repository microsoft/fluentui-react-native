/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

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

describe('Radio', () => {
  it('renders the default label and accessibility state', async () => {
    const component = await renderRadio({});
    const root = getRoot(component);

    expect(root.props.accessibilityLabel).toBe('Label');
    expect(root.props.accessibilityState).toEqual({ checked: false, disabled: false });
    expect(root.props.focusable).toBe(true);
    expect(component.getByText('Label')).toBeOnTheScreen();
    expect(component.queryByText('Description')).toBeNull();
  });

  it('shows secondary text and uses it as accessibility hint when visible', async () => {
    const component = await renderRadio({ label: 'Mail', secondaryText: 'Saves your selection', showSecondaryText: true });
    const root = getRoot(component);

    expect(root.props.accessibilityLabel).toBe('Mail');
    expect(root.props.accessibilityHint).toBe('Saves your selection');
    expect(component.getByText('Saves your selection')).toBeOnTheScreen();
  });

  it('resolves unselected colors and layout tokens', async () => {
    const tokens = useFlexTokens();
    const component = await renderRadio({ label: 'Choice' });

    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderRadius: tokens.borderRadius.base300,
      gap: tokens.spacing.componentBase100,
    });
    expect(StyleSheet.flatten(component.getByTestId('radio-indicator').props.style)).toMatchObject({
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderColor: tokens.color.strokeNeutralHeavy,
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      height: 16,
      width: 16,
    });
    expect(StyleSheet.flatten(component.getByTestId('radio-dot').props.style)).toMatchObject({
      backgroundColor: tokens.color.foregroundBrandPrimary,
      height: 10,
      opacity: 0,
      width: 10,
    });
    expect(StyleSheet.flatten(component.getByText('Choice').props.style)).toMatchObject({
      color: tokens.color.foregroundNeutralSecondary,
      fontSize: expect.any(Number),
    });
  });

  it('resolves selected colors and exposes checked accessibility state', async () => {
    const tokens = useFlexTokens().color;
    const component = await renderRadio({ label: 'Choice', selected: true });
    const root = getRoot(component);

    expect(root.props.accessibilityState).toEqual({ checked: true, disabled: false });
    expect(StyleSheet.flatten(component.getByTestId('radio-indicator').props.style).borderColor).toBe(tokens.strokeBrandLoud);
    expect(StyleSheet.flatten(component.getByTestId('radio-dot').props.style)).toMatchObject({
      backgroundColor: tokens.foregroundBrandPrimary,
      opacity: 1,
    });
    expect(StyleSheet.flatten(component.getByText('Choice').props.style).color).toBe(tokens.foregroundNeutralPrimary);
  });

  it('updates interaction colors on hover and press', async () => {
    const tokens = useFlexTokens().color;
    const component = await renderRadio({ label: 'Choice' });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(StyleSheet.flatten(component.getByTestId('radio-indicator').props.style).borderColor).toBe(
      tokens.hover.strokeNeutralHeavy,
    );
    expect(StyleSheet.flatten(component.getByText('Choice').props.style).color).toBe(tokens.hover.foregroundNeutralSecondary);

    await fireEvent(root, 'pressIn', {});
    expect(StyleSheet.flatten(component.getByTestId('radio-indicator').props.style).borderColor).toBe(
      tokens.pressed.strokeNeutralHeavy,
    );
    expect(StyleSheet.flatten(component.getByText('Choice').props.style).color).toBe(tokens.pressed.foregroundNeutralSecondary);
  });

  it('renders a focus ring when focused', async () => {
    const component = await renderRadio({ label: 'Choice' });
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

  it('disables interaction and preserves unrelated accessibility state', async () => {
    const component = await renderRadio({ accessibilityState: { busy: true }, disabled: true, label: 'Choice' });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ busy: true, checked: false, disabled: true });
  });

  it('applies user styles last and allows constrained labels to shrink', async () => {
    const component = await renderRadio({
      label: 'A long option label that needs room to wrap when the control is constrained',
      style: { backgroundColor: 'hotpink', width: 120 },
    });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(StyleSheet.flatten(component.getByText('A long option label that needs room to wrap when the control is constrained').props.style)).toMatchObject({
      flexShrink: 1,
    });
  });
});
