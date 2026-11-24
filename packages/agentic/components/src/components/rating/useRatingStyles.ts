import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { ratingStyles, ratingTokens } from './rating.styles';
import type { RatingState } from './rating.types';

export function useRatingStyles_unstable(state: RatingState) {
  const tokens = getComponentTokens(state, ratingTokens);
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.input, { style: [ratingStyles.input, resolveTokenStates(tokens.root, state).style] });
  attachSlotProps(state.target, { style: ratingStyles.target });
}
