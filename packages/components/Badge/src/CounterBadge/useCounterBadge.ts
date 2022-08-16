import { CounterBadgeProps, CounterBadgeInfo } from './CounterBadge.types';

export const useCounterBadge = (props: CounterBadgeProps): CounterBadgeInfo => {
  const DEFAULT_OVERFLOW_COUNT = 99;
  const { appearance, count = 0, dot, overflowCount = DEFAULT_OVERFLOW_COUNT, shadow, showZero, ...rest } = props;
  const showShadow = !!shadow && (!appearance || appearance === 'filled');
  const showBadge = count !== 0 || (count === 0 && showZero) || dot;

  return {
    props: {
      count,
      dot,
      overflowCount,
      showZero,
      shadow: showShadow,
      ...rest,
    },
    state: {
      showBadge,
    },
  };
};
