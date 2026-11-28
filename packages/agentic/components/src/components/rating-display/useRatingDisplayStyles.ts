import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { ratingDisplayStyles, ratingDisplayTokens } from './rating-display.styles';
import type { RatingDisplayState } from './rating-display.types';

export function useRatingDisplayStyles_unstable(state: RatingDisplayState) {
  const tokens = getComponentTokens(state, ratingDisplayTokens);
  attachSlotProps(state.root, { style: [ratingDisplayStyles.row, resolveTokenStates(tokens.root, state).style, state.userStyle] });
  if (state.stars) {
    attachSlotProps(state.stars, { style: [ratingDisplayStyles.row, resolveTokenStates(tokens.stars, state).style] });
  }
  if (state.value) {
    attachSlotProps(state.value, { style: resolveTokenStates(tokens.value, state).style });
  }
  if (state.count) {
    attachSlotProps(state.count, { style: resolveTokenStates(tokens.count, state).style });
  }
}
