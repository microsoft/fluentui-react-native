import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ComponentRef } from 'react';
import { View } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { chooseAdjacentKey, uniqueByKey } from '../../common/keyedCollection';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import { Dropdown } from '../dropdown/dropdown';
import type { TagPickerProps, TagPickerState } from './tag-picker.types';

export function useTagPicker_unstable({
  options: supplied,
  entryMode = 'selectOnly',
  selectedValues,
  defaultSelectedValues = [],
  onSelectionChange,
  open,
  defaultOpen,
  onOpenChange,
  variant,
  size = 'medium',
  disabled = false,
  error,
  accessibilityLabel,
  triggerLabel,
  triggerTestID,
  placeholder,
  formatRemoveLabel,
  formatAddLabel,
  style: userStyle,
  ...rootProps
}: TagPickerProps): TagPickerState {
  if (entryMode !== 'selectOnly') throw new Error('TagPicker editable modes require a native editor that can expose its active option.');
  const options = useMemo(() => uniqueByKey(supplied, (entry) => entry.value).filter((entry) => entry.label.trim()), [supplied]);
  const [values, setValues] = useControllableValue<readonly string[]>(selectedValues, defaultSelectedValues);
  const byValue = new Map(options.map((entry) => [entry.value, entry]));
  const selected = uniqueByKey<string>(values ?? [], (key) => key).flatMap((key) => {
    const option = byValue.get(key);
    return option ? [option] : [];
  });
  const selectedKeys = selected.map((option) => option.value);
  const previous = useRef(selectedKeys);
  const trigger = useRef<ComponentRef<typeof View> | null>(null);
  const focusedTag = useRef<string | undefined>(undefined);
  const tagFocus = useKeyedFocus(
    selected.map((option) => ({ value: option.value, disabled: disabled || option.disabled })),
    {
      mode: 'linear',
      remember: true,
      recoverValue: (key) => chooseAdjacentKey(key, previous.current, new Set<string>(selectedKeys)),
    },
  );
  useLayoutEffect(() => {
    const removed = focusedTag.current;
    if (removed && !selectedKeys.includes(removed)) {
      focusedTag.current = undefined;
      if (!disabled && !selected.some((option) => !option.disabled)) trigger.current?.focus();
    }
    previous.current = selectedKeys;
  }, [disabled, selected, selectedKeys]);
  const change = (next: readonly string[], value: string, reason: 'option' | 'remove') => {
    const option = byValue.get(value);
    if (disabled || !option || option.disabled) return;
    setValues(next);
    onSelectionChange?.(next, { value, reason });
  };
  useAccessibilityLabelWarning({
    componentName: 'TagPicker',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'TagPicker: provide a name for the picker separately from its removal actions.',
  });
  return {
    ...useThemeState(),
    size,
    visualState: disabled ? 'disabled' : 'rest',
    options,
    selected,
    userStyle,
    formatRemoveLabel,
    formatAddLabel,
    tagFocus: {
      ...tagFocus,
      getProps(key) {
        const props = tagFocus.getProps(key);
        return {
          ...props,
          onFocus: (event) => {
            focusedTag.current = key;
            props.onFocus(event);
          },
          onBlur: (event) => {
            if (focusedTag.current === key) focusedTag.current = undefined;
            props.onBlur(event);
          },
        };
      },
    },
    remove(value) {
      if (selectedKeys.includes(value))
        change(
          selectedKeys.filter((key) => key !== value),
          value,
          'remove',
        );
    },
    root: useSlot(View, { ...rootProps, accessible: true, accessibilityRole: 'group', accessibilityLabel, focusable: false }),
    tags: useSlot(View, {}),
    picker: useSlot(Dropdown, {
      children: null,
      open,
      defaultOpen,
      onOpenChange,
      variant,
      size,
      error,
      disabled,
      placeholder,
      selectionMode: 'multiple',
      selectedOptions: selectedKeys,
      trigger: { accessibilityLabel: triggerLabel?.trim() ? triggerLabel : accessibilityLabel, testID: triggerTestID, ref: trigger },
      onSelectedOptionsChange: (keys, { value }) => change(keys, value, 'option'),
    }),
  };
}
