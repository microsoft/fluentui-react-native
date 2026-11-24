import { renderSlider_unstable } from './renderSlider';
import type { SliderProps } from './slider.types';
import { useSlider_unstable } from './useSlider';
import { useSliderStyles_unstable } from './useSliderStyles';

export const Slider = (props: SliderProps) => {
  const state = useSlider_unstable(props);
  useSliderStyles_unstable(state);
  return renderSlider_unstable(state);
};
Slider.displayName = 'Slider';
