import { CounterBadgeProps, CounterBadgeInfo } from './CounterBadge.types';

export const useCounterBadge = (props: CounterBadgeProps): CounterBadgeInfo => {
  const DEFAULT_OVERFLOW_COUNT = 99;
  const { count, dot, overflowCount = DEFAULT_OVERFLOW_COUNT, showZero, ...rest } = props;

  const showBadge = count !== 0 || (count === 0 && showZero) || (count === 0 && dot);

  return {
    props: {
      count,
      dot,
      overflowCount,
      showZero,
      ...rest,
    },
    state: {
      showBadge,
    },
  };
};
