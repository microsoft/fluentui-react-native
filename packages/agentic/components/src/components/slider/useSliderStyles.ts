import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { sliderStyles, sliderTokens } from './slider.styles';
import type { SliderState } from './slider.types';

export function useSliderStyles_unstable(state: SliderState) {
  const tokens = getComponentTokens(state, sliderTokens);
  const rail = resolveTokenStates(tokens.rail, state).style;
  const track = resolveTokenStates(tokens.track, state).style;
  const target = resolveTokenStates(tokens.hitTarget, state).style;
  const vertical = state.orientation === 'vertical';
  const beginning = `${state.start * 100}%` as const;
  const length = `${(state.end - state.start) * 100}%` as const;
  state.targetSize = target.width ?? 28;
  state.thumbStyle = resolveTokenStates(tokens.thumb, state).style;
  state.markStyle = resolveTokenStates(tokens.mark, state).style;
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  attachSlotProps(state.input, {
    style: vertical ? [sliderStyles.vertical, { width: state.targetSize }] : [sliderStyles.horizontal, { height: state.targetSize }],
  });
  attachSlotProps(state.rail, { style: [sliderStyles.rail, rail, vertical ? { height: '100%' } : { width: '100%' }] });
  attachSlotProps(state.track, {
    style: [
      sliderStyles.layer,
      track,
      vertical ? { bottom: beginning, height: length, width: '100%' } : { start: beginning, width: length, height: '100%' },
    ],
  });
}
