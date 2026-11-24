import type { RatingDisplayProps } from './rating-display.types';
import { renderRatingDisplay_unstable } from './renderRatingDisplay';
import { useRatingDisplay_unstable } from './useRatingDisplay';
import { useRatingDisplayStyles_unstable } from './useRatingDisplayStyles';

export const RatingDisplay = (props: RatingDisplayProps) => {
  const state = useRatingDisplay_unstable(props);
  useRatingDisplayStyles_unstable(state);
  return renderRatingDisplay_unstable(state);
};

RatingDisplay.displayName = 'RatingDisplay';
