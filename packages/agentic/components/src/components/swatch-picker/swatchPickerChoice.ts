import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { isKeyboardPress } from '../../common/eventHandlers';
import { renderSwatch_unstable } from '../swatch/renderSwatch';
import { useSwatch } from '../swatch/useSwatch';
import { useSwatchStyles_unstable } from '../swatch/useSwatchStyles';
import type { SwatchPickerItem, SwatchPickerState } from './swatch-picker.types';

type SwatchPickerChoiceProps = Pick<SwatchPickerState, 'focus' | 'selectedValue' | 'size' | 'shape' | 'select' | 'measure'> & {
  item: SwatchPickerItem;
  index: number;
  count: number;
};

export function SwatchPickerChoice({ item, index, count, focus, selectedValue, size, shape, select, measure }: SwatchPickerChoiceProps) {
  const { register, getProps } = focus;
  const nativeProps = {
    ...getProps(item.value),
    accessibilityPosInSet: index + 1,
    accessibilitySetSize: count,
    onLayout: (event: LayoutChangeEvent) => measure(item.value, event.nativeEvent.layout),
  };
  const state = useSwatch({ ...item, ...nativeProps, size, shape, selected: selectedValue === item.value, onSelect: select }, (event) => {
    if (!nativeProps.focusable && !isKeyboardPress(event) && (Platform.OS === 'windows' || String(Platform.OS) === 'win32')) {
      focus.requestFocus(item.value, 'pointer');
    }
  });
  useLayoutEffect(() => register(item.value, state.focusTarget), [item.value, register, state.focusTarget]);
  useSwatchStyles_unstable(state);
  return renderSwatch_unstable(state);
}
