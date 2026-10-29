/** @jsxImportSource @fluentui-react-native/framework-base */
import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Checkbox } from './checkbox';
import type { CheckboxStatus } from './checkbox.types';

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

  describe('SPEC regression coverage', () => {
    afterEach(() => jest.restoreAllMocks());

    it('CBX-001 resolves omitted defaults rather than caller-supplied values', async () => {
      const component = await renderCheckbox({});
      expect(getRoot(component).props).toMatchObject({
        accessible: true,
        accessibilityLabel: 'Label',
        accessibilityState: { checked: false, disabled: false },
        focusable: true,
      });
      expect(getRoot(component)).toBeEnabled();
      expect(component.getByText('Label')).toBeOnTheScreen();
      expect(component.queryByTestId('checkbox-secondary', { includeHiddenElements: true })).toBeNull();
      expect(component.queryByTestId('checkbox-check-icon')).toBeNull();
      expect(component.queryByTestId('checkbox-dash-icon')).toBeNull();
      expect(getIndicatorStyle(component)).toMatchObject({
        borderRadius: defaultFlexTokens.borderRadius.base100,
        height: 16,
        width: 16,
      });
    });

    it('CBX-001 forwards native root props and the original layout event', async () => {
      const onLayout = jest.fn();
      const hitSlop = { bottom: 4, left: 8, right: 8, top: 4 };
      const component = await renderCheckbox({ focusable: false, hitSlop, nativeID: 'choice', onLayout, testID: 'consumer-checkbox' });
      const root = getRoot(component);
      expect(root).toBe(component.getByTestId('consumer-checkbox'));
      expect(root.props).toMatchObject({ focusable: false, hitSlop, nativeID: 'choice' });
      const event = { nativeEvent: { layout: { height: 24, width: 120, x: 0, y: 0 } } };
      await fireEvent(root, 'layout', event);
      expect(onLayout).toHaveBeenCalledTimes(1);
      expect(onLayout).toHaveBeenCalledWith(event);
    });

    describe.each(['unchecked', 'checked', 'indeterminate'] as const)('CBX-002 starting from %s', (status) => {
      it.each([false, true])('preserves status ownership and callback order with controlled=%s', async (controlled) => {
        const calls: string[] = [];
        const onStatusChange = jest.fn((next: CheckboxStatus) => calls.push(next));
        const onPress = jest.fn(() => calls.push('press'));
        const component = await renderCheckbox({
          defaultStatus: controlled ? (status === 'checked' ? 'unchecked' : 'checked') : status,
          onPress,
          onStatusChange,
          ...(controlled ? { status } : {}),
        });
        const initialChecked = status === 'indeterminate' ? 'mixed' : status === 'checked';
        expect(getRoot(component).props.accessibilityState.checked).toBe(initialChecked);
        const first = status === 'checked' ? 'unchecked' : 'checked';
        const second = controlled ? first : first === 'checked' ? 'unchecked' : 'checked';
        const event = { nativeEvent: { pageX: 12, pageY: 12 } };

        await fireEvent.press(getRoot(component), event);
        expect(getRoot(component).props.accessibilityState.checked).toBe(controlled ? initialChecked : first === 'checked');
        await fireEvent.press(getRoot(component), event);
        expect(getRoot(component).props.accessibilityState.checked).toBe(controlled ? initialChecked : second === 'checked');
        expect(onStatusChange.mock.calls).toEqual([[first], [second]]);
        expect(onPress).toHaveBeenCalledTimes(2);
        for (const call of [1, 2]) {
          expect(onPress).toHaveBeenNthCalledWith(
            call,
            expect.objectContaining({ nativeEvent: expect.objectContaining(event.nativeEvent) }),
          );
        }
        expect(calls).toEqual([first, 'press', second, 'press']);
      });

      it('does not report or apply a disabled press', async () => {
        const onPress = jest.fn();
        const onStatusChange = jest.fn();
        const component = await renderCheckbox({ defaultStatus: status, disabled: true, onPress, onStatusChange });
        await fireEvent.press(getRoot(component));
        expect(onPress).not.toHaveBeenCalled();
        expect(onStatusChange).not.toHaveBeenCalled();
        expect(getRoot(component).props.accessibilityState.checked).toBe(status === 'indeterminate' ? 'mixed' : status === 'checked');
      });
    });

    it('CBX-002 keeps defaultStatus as an initializer and accepts later controlled values', async () => {
      const component = await renderCheckbox({ defaultStatus: 'checked' });
      await component.rerender(<Checkbox defaultStatus="unchecked" />);
      expect(getRoot(component).props.accessibilityState.checked).toBe(true);

      const controlled = await renderCheckbox({ status: 'unchecked', defaultStatus: 'checked' });
      await controlled.rerender(<Checkbox status="indeterminate" defaultStatus="checked" />);
      expect(getRoot(controlled).props.accessibilityState.checked).toBe('mixed');
    });

    it.each([
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ])('CBX-003 gates text and development warnings with showLabel=%s and showSecondaryText=%s', async (showLabel, showSecondaryText) => {
      const warn = jest.spyOn(console, 'warn').mockImplementation();
      const component = await renderCheckbox({ showLabel, showSecondaryText, accessibilityHint: 'Caller hint' });
      expect(component.queryByTestId('checkbox-label') !== null).toBe(showLabel);
      expect(component.queryByTestId('checkbox-secondary', { includeHiddenElements: true }) !== null).toBe(showLabel && showSecondaryText);
      expect(getRoot(component).props.accessibilityHint).toBe(showLabel && showSecondaryText ? 'Caller hint. Description' : 'Caller hint');
      if (showSecondaryText && !showLabel) {
        expect(warn.mock.calls).toEqual([['Checkbox: secondary text requires a visible label.']]);
      } else {
        expect(warn).not.toHaveBeenCalled();
      }
    });

    it('CBX-003 and CBX-004 render indicator, label, and secondary text in order without duplicate accessible nodes', async () => {
      const component = await renderCheckbox({ showSecondaryText: true });
      const indicator = component.getByTestId('checkbox-indicator');
      const label = component.getByTestId('checkbox-label');
      const secondary = component.getByTestId('checkbox-secondary', { includeHiddenElements: true });
      expect(getRoot(component).children).toEqual([
        indicator,
        expect.objectContaining({
          props: expect.objectContaining({ accessible: false }),
          children: [label, secondary],
        }),
      ]);
      expect(indicator.props.accessible).toBe(false);
      expect(label.props.accessible).toBe(false);
      expect(secondary.props).toMatchObject({ accessible: false, accessibilityElementsHidden: true });
      expect(secondary).toHaveTextContent('Description');
    });

    it('CBX-004 owns role and checked/disabled state while preserving caller context', async () => {
      const component = await renderCheckbox({
        accessibilityRole: 'button',
        accessibilityState: { busy: true, checked: false, disabled: true },
        accessibilityLabel: 'Explicit option name',
        accessibilityHint: 'Caller context',
        secondaryText: 'Supporting context',
        showSecondaryText: true,
        status: 'indeterminate',
      });
      expect(getRoot(component).props).toMatchObject({
        accessibilityRole: 'checkbox',
        accessibilityState: { busy: true, checked: 'mixed', disabled: false },
        accessibilityLabel: 'Explicit option name',
        accessibilityHint: 'Caller context. Supporting context',
      });
    });

    it.each(['unchecked', 'checked', 'indeterminate'] as const)(
      'CBX-005 resolves all %s colors and restores hover after release',
      async (status) => {
        const colors = defaultFlexTokens.color;
        const component = await renderCheckbox({ status, showSecondaryText: true });
        for (const [event, palette] of [
          ['hoverIn', colors.hover],
          ['pressIn', colors.pressed],
          ['pressOut', colors.hover],
          ['hoverOut', colors],
        ] as const) {
          await fireEvent(getRoot(component), event, {});
          expect(getIndicatorStyle(component)).toMatchObject({
            backgroundColor: status === 'unchecked' ? palette.backgroundNeutralTransparent : palette.backgroundBrandHeavy,
            borderColor: status === 'unchecked' ? palette.strokeNeutralHeavy : palette.strokeNeutralTransparent,
          });
          expect(StyleSheet.flatten(component.getByTestId('checkbox-label').props.style).color).toBe(
            status === 'unchecked' ? palette.foregroundNeutralSecondary : palette.foregroundNeutralPrimary,
          );
          expect(StyleSheet.flatten(component.getByTestId('checkbox-secondary', { includeHiddenElements: true }).props.style).color).toBe(
            palette.foregroundNeutralSecondary,
          );
          if (status !== 'unchecked') {
            expect(StyleSheet.flatten(component.getByText(status === 'checked' ? '\u2713' : '\u2212').props.style).color).toBe(
              palette.foregroundBrandOnloud,
            );
          }
        }
      },
    );

    it.each(['unchecked', 'checked', 'indeterminate'] as const)(
      'CBX-005 selects disabled %s colors during an active press',
      async (status) => {
        const component = await renderCheckbox({ status, showSecondaryText: true });
        await fireEvent(getRoot(component), 'hoverIn', {});
        await fireEvent(getRoot(component), 'pressIn', {});
        await component.rerender(<Checkbox status={status} showSecondaryText disabled />);
        const colors = defaultFlexTokens.color;
        expect(getIndicatorStyle(component)).toMatchObject({
          backgroundColor: status === 'unchecked' ? colors.backgroundNeutralTransparent : colors.backgroundNeutralHeavyDisabled,
          borderColor: status === 'unchecked' ? colors.strokeNeutralDisabled : colors.strokeNeutralTransparent,
        });
        for (const id of ['checkbox-label', 'checkbox-secondary']) {
          expect(StyleSheet.flatten(component.getByTestId(id, { includeHiddenElements: true }).props.style).color).toBe(
            colors.foregroundNeutralDisabled,
          );
        }
        if (status !== 'unchecked') {
          expect(StyleSheet.flatten(component.getByText(status === 'checked' ? '\u2713' : '\u2212').props.style).color).toBe(
            colors.foregroundNeutralDisabled,
          );
        }
      },
    );

    it('CBX-005 applies the last caller style after structural and token styles', async () => {
      const component = await renderCheckbox({
        style: [
          { minHeight: 40, gap: 20 },
          { minHeight: 48, gap: 12, flexDirection: 'column' },
        ],
      });
      expect(getRootStyle(component)).toMatchObject({ minHeight: 48, gap: 12, flexDirection: 'column' });
    });
  });
});
