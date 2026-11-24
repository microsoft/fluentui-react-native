import { renderSwatchPicker_unstable } from './renderSwatchPicker';
import type { SwatchPickerProps } from './swatch-picker.types';
import { useSwatchPicker_unstable } from './useSwatchPicker';
import { useSwatchPickerStyles_unstable } from './useSwatchPickerStyles';

export const SwatchPicker = (props: SwatchPickerProps) => {
  const state = useSwatchPicker_unstable(props);
  useSwatchPickerStyles_unstable(state);
  return renderSwatchPicker_unstable(state);
};
SwatchPicker.displayName = 'SwatchPicker';
