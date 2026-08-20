/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Checkbox } from './checkbox';

function renderCheckbox(props: React.ComponentProps<typeof Checkbox>): Promise<RenderResult> {
  return render(<Checkbox {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('checkbox');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

function getIndicatorStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('checkbox-indicator').props.style);
}

describe('Checkbox', () => {
  it('renders default checkbox accessibility and secondary styling', async () => {
    const colors = useFlexTokens().color;
    const component = await renderCheckbox({ label: 'Save drafts' });
    const root = getRoot(component);

    expect(root.props.accessibilityRole).toBe('checkbox');
    expect(root.props.accessibilityState).toEqual({ checked: false, disabled: false });
    expect(root.props.accessibilityLabel).toBe('Save drafts');
    expect(component.getByText('Save drafts')).toBeOnTheScreen();
    expect(getIndicatorStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: colors.backgroundNeutralTransparent,
      borderColor: colors.strokeNeutralHeavy,
    });
    expect(getRootStyle(component)).toMatchObject({
      borderStyle: 'solid',
      minHeight: 24,
      minWidth: 24,
    });
  });

  it('toggles uncontrolled status on press and forwards user handlers', async () => {
    const onPress = jest.fn();
    const onStatusChange = jest.fn();
    const component = await renderCheckbox({ label: 'Save drafts', onPress, onStatusChange });
    const root = getRoot(component);

    await fireEvent.press(root);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith('checked');
    expect(getRoot(component).props.accessibilityState).toEqual({ checked: true, disabled: false });
  });

  it('reports presses without changing state when the status is externally driven', async () => {
    const onStatusChange = jest.fn();
    const component = await renderCheckbox({ onStatusChange, status: 'unchecked' });

    await fireEvent.press(component.getByRole('checkbox'));

    expect(onStatusChange).toHaveBeenCalledWith('checked');
    expect(component.getByRole('checkbox').props.accessibilityState.checked).toBe(false);
  });

  it('advances indeterminate status to checked on press', async () => {
    const onStatusChange = jest.fn();
    const component = await renderCheckbox({
      defaultStatus: 'indeterminate',
      label: 'Parent',
      onStatusChange,
    });

    await fireEvent.press(getRoot(component));

    expect(onStatusChange).toHaveBeenCalledWith('checked');
    expect(getRoot(component).props.accessibilityState).toEqual({ checked: true, disabled: false });
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderCheckbox({ disabled: true, label: 'Unavailable', onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ checked: false, disabled: true });
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders checked and indeterminate indicator glyphs', async () => {
    const checked = await renderCheckbox({ label: 'Checked', status: 'checked' });
    expect(StyleSheet.flatten(checked.getByTestId('checkbox-check-icon').props.style)).toMatchObject({
      height: 12,
      width: 12,
    });
    expect(getRoot(checked).props.accessibilityState).toEqual({ checked: true, disabled: false });

    const indeterminate = await renderCheckbox({ label: 'Mixed', status: 'indeterminate' });
    expect(StyleSheet.flatten(indeterminate.getByTestId('checkbox-dash-icon').props.style)).toMatchObject({
      height: 12,
      width: 12,
    });
    expect(getRoot(indeterminate).props.accessibilityState).toEqual({ checked: 'mixed', disabled: false });
  });

  it('shows secondary text and exposes it as a description', async () => {
    const component = await renderCheckbox({
      label: 'Notify me',
      secondaryText: 'We will only send critical updates.',
      showSecondaryText: true,
    });

    expect(component.getAllByText('We will only send critical updates.', { includeHiddenElements: true })).toHaveLength(1);
    expect(getRoot(component).props.accessibilityHint).toBe('We will only send critical updates.');
  });

  it('keeps the visible label optional while preserving an accessible name', async () => {
    const component = await renderCheckbox({
      accessibilityLabel: 'Select option',
      label: 'Hidden label',
      showLabel: false,
    });

    expect(component.queryByText('Hidden label')).toBeNull();
    expect(getRoot(component).props.accessibilityLabel).toBe('Select option');
  });

  it('falls back to the label text when the visible label is hidden', async () => {
    const component = await renderCheckbox({
      label: 'Hidden label',
      showLabel: false,
    });

    expect(component.queryByText('Hidden label')).toBeNull();
    expect(getRoot(component).props.accessibilityLabel).toBe('Hidden label');
  });

  it('resolves hover and pressed feedback for label, indicator, and status colors', async () => {
    const colors = useFlexTokens().color;
    const component = await renderCheckbox({ label: 'Hover me' });
    const root = getRoot(component);

    expect(getIndicatorStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralTransparent,
      borderColor: colors.strokeNeutralHeavy,
    });

    await fireEvent(root, 'hoverIn', {});
    expect(getIndicatorStyle(component)).toMatchObject({
      backgroundColor: colors.hover.backgroundNeutralTransparent,
      borderColor: colors.hover.strokeNeutralHeavy,
    });
    expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style).color).toBe(colors.hover.foregroundNeutralSecondary);

    await fireEvent(root, 'pressIn', {});
    expect(getIndicatorStyle(component)).toMatchObject({
      backgroundColor: colors.pressed.backgroundNeutralTransparent,
      borderColor: colors.pressed.strokeNeutralHeavy,
    });
    expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style).color).toBe(colors.pressed.foregroundNeutralSecondary);
  });

  it('renders the persistent dual-ring focus visual', async () => {
    const colors = useFlexTokens().color;
    const component = await renderCheckbox({ label: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});

    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: colors.strokeFocusOuter,
      borderWidth: 2,
    });
    expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style)).not.toHaveProperty(
      'opacity',
    );
    expect(StyleSheet.flatten(component.getByTestId('focus-visual-inner', { includeHiddenElements: true }).props.style)).toMatchObject({
      borderColor: colors.strokeFocusInner,
      borderWidth: 1,
    });
  });

  it.each([
    ['standard', 'base100'],
    ['circular', 'circular'],
  ] as const)('resolves the %s variant', async (variant, radiusKey) => {
    const tokens = useFlexTokens().borderRadius;
    const component = await renderCheckbox({ label: variant, variant });
    expect(getIndicatorStyle(component).borderRadius).toBe(tokens[radiusKey]);
  });

  it.each(['unchecked', 'checked', 'indeterminate'] as const)('resolves %s status colors', async (status) => {
    const colors = useFlexTokens().color;
    const component = await renderCheckbox({ label: status, status });
    const label = component.getByTestId('checkbox-label');
    const indicator = component.getByTestId('checkbox-indicator');
    const expectedBackground = status === 'unchecked' ? colors.backgroundNeutralTransparent : colors.backgroundBrandHeavy;
    const expectedLabelColor = status === 'unchecked' ? colors.foregroundNeutralSecondary : colors.foregroundNeutralPrimary;

    expect(StyleSheet.flatten(indicator.props.style).backgroundColor).toBe(expectedBackground);
    expect(StyleSheet.flatten(label.props.style).color).toBe(expectedLabelColor);
    if (status !== 'unchecked') {
      const icon = component.getByTestId(status === 'indeterminate' ? 'checkbox-dash-icon' : 'checkbox-check-icon');
      expect(StyleSheet.flatten(icon.props.style).color).toBe(colors.foregroundBrandOnloud);
    }
  });

  it('allows constrained label text to wrap', async () => {
    const component = await renderCheckbox({
      label: 'This is a long checkbox label that should wrap when the control is constrained',
      style: { width: 180 },
    });

    expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style)).toMatchObject({
      flexShrink: 1,
    });
  });

  it('applies disabled colors to the label and indicator', async () => {
    const component = await renderCheckbox({ disabled: true, label: 'Disabled', status: 'checked' });
    const tokens = useFlexTokens().color;

    expect(StyleSheet.flatten(component.getByTestId('checkbox-indicator').props.style)).toMatchObject({
      backgroundColor: tokens.backgroundNeutralHeavyDisabled,
      borderColor: tokens.strokeNeutralTransparent,
    });
    expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style).color).toBe(tokens.foregroundNeutralDisabled);
  });
});
