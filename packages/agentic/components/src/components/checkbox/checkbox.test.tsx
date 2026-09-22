/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

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
    const colors = defaultFlexTokens.color;
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

  describe.each([
    ['windows', 'toggle'],
    ['win32', 'Toggle'],
    ['macos', 'Toggle'],
  ] as const)('%s accessibility actions', (platform, actionName) => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    });
    afterEach(() => jest.restoreAllMocks());

    it.each(['unchecked', 'checked', 'indeterminate'] as const)('toggles %s once without synthesizing a press', async (status) => {
      const calls: string[] = [];
      const onStatusChange = jest.fn(() => calls.push('status'));
      const onPress = jest.fn();
      const onAccessibilityAction = jest.fn(() => calls.push('action'));
      const component = await renderCheckbox({ defaultStatus: status, onStatusChange, onPress, onAccessibilityAction });
      const event = { nativeEvent: { actionName } };

      expect(getRoot(component).props.accessibilityActions).toEqual([{ name: actionName }]);
      await fireEvent(getRoot(component), 'accessibilityAction', event);

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(status === 'checked' ? 'unchecked' : 'checked');
      expect(getRoot(component).props.accessibilityState.checked).toBe(status !== 'checked');
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledWith(event);
      expect(calls).toEqual(['status', 'action']);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('preserves a normalized caller action list and labels', async () => {
      const accessibilityActions = [
        { name: actionName, label: 'Change selection' },
        { name: 'custom', label: 'More' },
      ];
      const component = await renderCheckbox({ accessibilityActions });
      expect(getRoot(component).props.accessibilityActions).toBe(accessibilityActions);
    });

    it('deduplicates legacy and native spellings without losing the caller label or custom actions', async () => {
      const component = await renderCheckbox({
        accessibilityActions: [{ name: 'Toggle', label: 'Change selection' }, { name: 'toggle' }, { name: 'custom', label: 'More' }],
      });
      expect(getRoot(component).props.accessibilityActions).toEqual([
        { name: actionName, label: 'Change selection' },
        { name: 'custom', label: 'More' },
      ]);
    });

    it('reports accessibility toggles without changing externally driven status', async () => {
      const onStatusChange = jest.fn();
      const component = await renderCheckbox({ status: 'indeterminate', onStatusChange });

      await fireEvent(getRoot(component), 'accessibilityAction', { nativeEvent: { actionName } });

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith('checked');
      expect(getRoot(component).props.accessibilityState.checked).toBe('mixed');
    });

    it('blocks disabled accessibility toggles while forwarding the caller handler once', async () => {
      const onStatusChange = jest.fn();
      const onPress = jest.fn();
      const onAccessibilityAction = jest.fn();
      const component = await renderCheckbox({ disabled: true, onStatusChange, onPress, onAccessibilityAction });
      const event = { nativeEvent: { actionName } };

      getRoot(component).props.onAccessibilityAction(event);

      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onPress).not.toHaveBeenCalled();
      expect(onAccessibilityAction).toHaveBeenCalledTimes(1);
      expect(onAccessibilityAction).toHaveBeenCalledWith(event);
      expect(getRoot(component).props.accessibilityState.checked).toBe(false);
    });

    it('forwards custom, wrong-case, and activate actions without a second activation path', async () => {
      const onStatusChange = jest.fn();
      const onPress = jest.fn();
      const onAccessibilityAction = jest.fn();
      const component = await renderCheckbox({
        accessibilityActions: [{ name: 'custom', label: 'More' }],
        onStatusChange,
        onPress,
        onAccessibilityAction,
      });
      expect(getRoot(component).props.accessibilityActions).toEqual([{ name: actionName }, { name: 'custom', label: 'More' }]);
      for (const name of ['custom', actionName === 'toggle' ? 'Toggle' : 'toggle', 'activate']) {
        const event = { nativeEvent: { actionName: name } };
        await fireEvent(getRoot(component), 'accessibilityAction', event);
        expect(onAccessibilityAction).toHaveBeenLastCalledWith(event);
      }
      expect(onAccessibilityAction).toHaveBeenCalledTimes(3);
      expect(onStatusChange).not.toHaveBeenCalled();
      expect(onPress).not.toHaveBeenCalled();
      expect(getRoot(component).props.accessibilityState.checked).toBe(false);
    });
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
    const colors = defaultFlexTokens.color;
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

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderCheckbox({ label: 'Focused' });
    const root = getRoot(component);

    expect(root.props.enableFocusRing).toBe(true);
    await fireEvent(root, 'pressIn', {});
    await fireEvent(root, 'focus', {});
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();

    await fireEvent(root, 'blur', {});
    await fireEvent(root, 'focus', {});

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it.each([
    ['standard', 'base100'],
    ['circular', 'circular'],
  ] as const)('resolves the %s variant', async (variant, radiusKey) => {
    const tokens = defaultFlexTokens.borderRadius;
    const component = await renderCheckbox({ label: variant, variant });
    expect(getIndicatorStyle(component).borderRadius).toBe(tokens[radiusKey]);
  });

  it.each(['unchecked', 'checked', 'indeterminate'] as const)('resolves %s status colors', async (status) => {
    const colors = defaultFlexTokens.color;
    const component = await renderCheckbox({ label: status, status });
    const label = component.getByTestId('checkbox-label');
    const indicator = component.getByTestId('checkbox-indicator');
    const expectedBackground = status === 'unchecked' ? colors.backgroundNeutralTransparent : colors.backgroundBrandHeavy;
    const expectedLabelColor = status === 'unchecked' ? colors.foregroundNeutralSecondary : colors.foregroundNeutralPrimary;

    expect(StyleSheet.flatten(indicator.props.style).backgroundColor).toBe(expectedBackground);
    expect(StyleSheet.flatten(label.props.style).color).toBe(expectedLabelColor);
    if (status !== 'unchecked') {
      const icon = component.getByText(status === 'indeterminate' ? '\u2212' : '\u2713');
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
    const tokens = defaultFlexTokens.color;

    expect(StyleSheet.flatten(component.getByTestId('checkbox-indicator').props.style)).toMatchObject({
      backgroundColor: tokens.backgroundNeutralHeavyDisabled,
      borderColor: tokens.strokeNeutralTransparent,
    });
    expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style).color).toBe(tokens.foregroundNeutralDisabled);
  });
});
