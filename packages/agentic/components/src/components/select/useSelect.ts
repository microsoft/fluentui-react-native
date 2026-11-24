import { useMemo } from 'react';
import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { desktopControls } from '../../common/desktopControls';
import { uniqueByKey } from '../../common/keyedCollection';
import type { SelectProps, SelectState } from './select.types';

export function useSelect_unstable({
  options,
  value,
  defaultValue = null,
  onValueChange,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
  pickerTestID,
  size = 'medium',
  variant = 'outline',
  disabled = false,
  error = false,
  style: userStyle,
  ...rootProps
}: SelectProps): SelectState {
  if (!desktopControls) throw new Error('Select requires a native picker. The current preview supports AppKit only.');
  const [selected, setSelected] = useControllableValue<string | null>(value, defaultValue);
  const records = useMemo(
    () =>
      uniqueByKey(options, (option) => option.value)
        .filter((option) => option.label.trim())
        .map((option) => ({ key: option.value, label: option.label, disabled: !!option.disabled })),
    [options],
  );
  const resolved = records.find((option) => option.key === selected)?.key;
  const isDisabled = disabled || !accessibilityLabel.trim();
  useAccessibilityLabelWarning({
    componentName: 'Select',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'Select: provide a localized picker name independent of placeholder and value.',
  });
  return {
    ...useThemeState(),
    size,
    variant,
    visualState: isDisabled ? 'disabled' : error ? 'error' : 'rest',
    userStyle,
    root: useSlot(View, { ...rootProps, accessible: false, focusable: false }),
    picker: useSlot(desktopControls.SingleSelect, {
      targetLabel: accessibilityLabel,
      targetHelp: accessibilityHint,
      targetTestID: pickerTestID,
      testID: pickerTestID,
      disabled: isDisabled,
      invalid: error,
      options: records,
      selectedKey: resolved,
      placeholder,
      onSelectionRequest: ({ nativeEvent }) => {
        const key = nativeEvent.key;
        if (isDisabled || resolved === key || !records.some((option) => option.key === key && !option.disabled)) return;
        setSelected(key);
        onValueChange?.(key);
      },
    }),
  };
}
