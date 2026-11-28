import type { RatingProps } from './rating.types';
import { renderRating_unstable } from './renderRating';
import { useRating_unstable } from './useRating';
import { useRatingStyles_unstable } from './useRatingStyles';

export const Rating = (props: RatingProps) => {
  const state = useRating_unstable(props);
  useRatingStyles_unstable(state);
  return renderRating_unstable(state);
};
Rating.displayName = 'Rating';
