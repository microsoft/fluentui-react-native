import { useLayoutEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import type { SpinButtonChangeReason, SpinButtonProps, SpinButtonState } from './spin-button.types';

export function useSpinButton_unstable({
  value,
  defaultValue = 0,
  min = -Number.MAX_VALUE,
  max = Number.MAX_VALUE,
  step = 1,
  largeStep,
  parse,
  format,
  onValueChange,
  onInvalidChange,
  accessibilityLabel,
  incrementLabel,
  decrementLabel,
  size = 'medium',
  variant = 'outline',
  disabled = false,
  readOnly = false,
  editorTestID,
  style: userStyle,
  ...rootProps
}: SpinButtonProps): SpinButtonState {
  if (!desktopControls?.SpinEditor) throw new Error('SpinButton requires a native writable numeric editor.');
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max ||
    !Number.isFinite(step) ||
    step <= 0 ||
    (largeStep !== undefined && (!Number.isFinite(largeStep) || largeStep <= 0)) ||
    (value !== undefined && !Number.isFinite(value)) ||
    !Number.isFinite(defaultValue)
  ) {
    throw new TypeError('SpinButton requires finite ordered bounds, finite values, and positive steps.');
  }

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const [unresolved, setValue] = useControllableValue<number>(value, clamp(defaultValue));
  const committed = clamp(unresolved ?? 0);
  const [draft, setDraft] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const attempted = useRef<string | undefined>(undefined);
  const display = format(committed);
  const valid = !!accessibilityLabel.trim() && !!incrementLabel.trim() && !!decrementLabel.trim();
  const inactive = disabled || !valid;
  const editable = !inactive && !readOnly;
  const diagnose = (next: boolean) => {
    if (next === invalid) return;
    setInvalid(next);
    onInvalidChange?.(next);
  };
  useLayoutEffect(() => {
    if (inactive || readOnly) {
      attempted.current = undefined;
      setDraft(undefined);
      setInvalid(false);
    }
  }, [inactive, readOnly]);
  const accept = (next: number, reason: SpinButtonChangeReason) => {
    if (!editable || !Number.isFinite(next) || next < min || next > max) return;
    setDraft(undefined);
    diagnose(false);
    if (next !== committed) {
      setValue(next);
      onValueChange?.(next, { reason });
    }
  };
  const acceptText = (text: string, reason: SpinButtonChangeReason) => {
    if (attempted.current === text) return;
    attempted.current = text;
    const parsed = parse(text);
    if (parsed == null || !Number.isFinite(parsed) || parsed < min || parsed > max) {
      setDraft(text);
      diagnose(true);
    } else accept(parsed, reason);
  };
  const adjust = (up: boolean, amount: number) => {
    const raw = clamp(committed + amount * (up ? 1 : -1));
    const next = clamp(Number(raw.toPrecision(15)));
    if (next === committed) return;
    attempted.current = undefined;
    accept(next, up ? 'increment' : 'decrement');
  };
  useAccessibilityLabelWarning({
    componentName: 'SpinButton',
    accessibilityLabel: valid ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'SpinButton: provide localized editor, increment, and decrement names.',
  });
  return {
    ...useThemeState(),
    size,
    variant,
    userStyle,
    invalid,
    visualState: inactive ? 'disabled' : 'rest',
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    editor: useSlot(desktopControls.SpinEditor, {
      targetLabel: accessibilityLabel,
      incrementLabel,
      decrementLabel,
      targetTestID: editorTestID,
      testID: editorTestID,
      minimum: min,
      maximum: max,
      hasLargeStep: largeStep !== undefined,
      draft: draft ?? display,
      numericValue: committed,
      disabled: inactive,
      readOnly,
      invalid,
      canIncrement: editable && committed < max,
      canDecrement: editable && committed > min,
      onEditorInput: ({ nativeEvent: { kind, text, value: exact } }) => {
        if (!editable) return;
        switch (kind) {
          case 'change':
            attempted.current = undefined;
            setDraft(text);
            break;
          case 'commit':
            acceptText(text, 'typed');
            break;
          case 'cancel':
            attempted.current = undefined;
            setDraft(undefined);
            diagnose(false);
            break;
          case 'increment':
            adjust(true, step);
            break;
          case 'decrement':
            adjust(false, step);
            break;
          case 'page-up':
            if (largeStep !== undefined) adjust(true, largeStep);
            break;
          case 'page-down':
            if (largeStep !== undefined) adjust(false, largeStep);
            break;
          case 'accessibility-text':
            attempted.current = undefined;
            acceptText(text, 'accessibility');
            break;
          case 'accessibility-value':
            attempted.current = undefined;
            accept(exact, 'accessibility');
            break;
        }
      },
    }),
  };
}
