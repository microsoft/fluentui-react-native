import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useOptionalSlot, useSlot } from '@fluentui-react-native/framework-base';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import { Label } from '../label/label';
import type { RadioGroupOption, RadioGroupProps, RadioGroupState } from './radio-group.types';

export function useRadioGroup_unstable({
  label,
  accessibilityLabel,
  options,
  orientation = 'vertical',
  value,
  defaultValue = null,
  onValueChange,
  required = false,
  disabled = false,
  style: userStyle,
  ...rootProps
}: RadioGroupProps): RadioGroupState {
  const items = useMemo(() => {
    const values = new Set<string>();
    return options.reduce<RadioGroupOption[]>((entries, entry) => {
      if (!entry.value.trim() || !entry.label.trim() || values.has(entry.value)) return entries;
      values.add(entry.value);
      entries.push({ ...entry, disabled: disabled || entry.disabled });
      return entries;
    }, []);
  }, [disabled, options]);
  useEffect(() => {
    if (__DEV__ && items.length !== options.length) console.warn('RadioGroup: use unique, nonblank values and localized option labels.');
  }, [items.length, options.length]);

  const [selection, setSelection] = useControllableValue(value, defaultValue);
  const selectedValue = items.some((entry) => entry.value === selection) ? (selection ?? null) : null;
  const select = (next: string) => {
    if (next === selectedValue || !items.some((entry) => entry.value === next && !entry.disabled)) return;
    setSelection(next);
    onValueChange?.(next);
  };
  const focus = useKeyedFocus(items, { entryValue: selectedValue, mode: 'linear', onNavigate: select });
  const name = accessibilityLabel?.trim() ? accessibilityLabel : label?.trim() ? label : undefined;
  useAccessibilityLabelWarning({
    componentName: 'RadioGroup',
    accessibilityLabel: name,
    requireLabel: true,
    warning: 'RadioGroup: provide a visible label or a localized accessibilityLabel.',
  });
  const accessibilityState = { disabled, required };

  return {
    ...useThemeState(),
    items,
    selectedValue,
    orientation,
    select,
    focus,
    userStyle,
    root: useSlot(View, {
      ...rootProps,
      accessible: true,
      accessibilityRole: 'radiogroup',
      accessibilityLabel: name,
      accessibilityState,
      focusable: false,
    }),
    legend: useOptionalSlot(Label, label?.trim() ? { content: label, required, disabled } : null),
    options: useSlot(View, {}),
  };
}
