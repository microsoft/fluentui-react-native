import type { CardProps } from './card.types';
import { useCard_unstable } from './useCard';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderCard_unstable } from './renderCard';

/**
 * A Card component for grouped content and actions.
 */
export const Card = (props: CardProps) => {
  const state = useCard_unstable(props);
  useApplyStyles_unstable(state);
  return renderCard_unstable(state);
};

Card.displayName = 'Card';

export default Card;
