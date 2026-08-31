import type { CardProps } from './card.types';
import { useCard_unstable } from './useCard';
import { useCardStyles_unstable } from './useCardStyles';
import { renderCard_unstable } from './renderCard';

/**
 * A Card component for grouped content and actions.
 */
export const Card = (props: CardProps) => {
  const state = useCard_unstable(props);
  useCardStyles_unstable(state);
  return renderCard_unstable(state);
};

Card.displayName = 'Card';

export default Card;
