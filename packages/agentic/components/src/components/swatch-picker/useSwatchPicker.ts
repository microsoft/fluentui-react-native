import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import type { LayoutRectangle } from 'react-native';
import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useControllableValue, useSlot } from '@fluentui-react-native/framework-base';
import { useKeyedFocus } from '../../common/useKeyedFocus';
import type { SwatchPickerItem, SwatchPickerProps, SwatchPickerState } from './swatch-picker.types';
import { adjacentSwatchRow } from './swatchGridNavigation';

export function useSwatchPicker_unstable({
  items: supplied,
  value,
  defaultValue = null,
  onValueChange,
  accessibilityLabel,
  layout = 'row',
  shape = 'circular',
  size = 'medium',
  style: userStyle,
  ...rootProps
}: SwatchPickerProps): SwatchPickerState {
  const items = useMemo(() => {
    const values = new Set<string>();
    const options: SwatchPickerItem[] = [];
    for (const entry of supplied) {
      if (!entry.value.trim() || !entry.accessibilityLabel.trim() || values.has(entry.value)) continue;
      if (options.length && entry.sample.kind !== options[0].sample.kind) continue;
      values.add(entry.value);
      options.push(entry);
    }
    return options;
  }, [supplied]);
  const geometry = useRef(new Map<string, LayoutRectangle>());
  useEffect(() => {
    const current = new Set(items.map((entry) => entry.value));
    for (const value of geometry.current.keys()) {
      if (!current.has(value)) geometry.current.delete(value);
    }
  }, [items]);
  useEffect(() => {
    if (__DEV__ && supplied.length !== items.length) console.warn('SwatchPicker: use unique, named choices of one sample kind.');
  }, [items.length, supplied.length]);
  useAccessibilityLabelWarning({
    componentName: 'SwatchPicker',
    accessibilityLabel: accessibilityLabel.trim() ? accessibilityLabel : undefined,
    requireLabel: true,
    warning: 'SwatchPicker: name the choice group with an accessibilityLabel.',
  });
  const [selected, setSelected] = useControllableValue(value, defaultValue);
  const selectedValue = items.some((entry) => entry.value === selected) ? (selected ?? null) : null;
  const select = (next: string) => {
    if (next === selectedValue || !items.some((entry) => entry.value === next && !entry.disabled)) return;
    setSelected(next);
    onValueChange?.(next);
  };
  const focus = useKeyedFocus(items, {
    entryValue: selectedValue,
    mode: layout === 'grid' ? 'grid' : 'horizontal',
    onNavigate: select,
    moveVertically: (key, direction) => adjacentSwatchRow(items, geometry.current, key, direction),
  });
  return {
    ...useThemeState(),
    items,
    selectedValue,
    layout,
    shape,
    size,
    userStyle,
    select,
    focus,
    measure: (key, rect) => {
      geometry.current.set(key, rect);
    },
    root: useSlot(View, { ...rootProps, accessible: true, accessibilityRole: 'radiogroup', accessibilityLabel, focusable: false }),
  };
}
