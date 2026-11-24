import type { RatingItemProps } from './rating-item.types';
import { renderRatingItem } from './renderRatingItem';
import { useRatingItem } from './useRatingItem';
import { useRatingItemStyles } from './useRatingItemStyles';

export const RatingItem = (props: RatingItemProps) => {
  const state = useRatingItem(props);
  useRatingItemStyles(state);
  return renderRatingItem(state);
};

RatingItem.displayName = 'RatingItem';
