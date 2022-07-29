import { CounterBadgeProps, CounterBadgeInfo } from './CounterBadge.types';

export const useCounterBadge = (props: CounterBadgeProps): CounterBadgeInfo => {
  const DEFAULT_OVERFLOW_COUNT = 99;
  const { dot, overflowCount = DEFAULT_OVERFLOW_COUNT, showZero, count, ...rest } = props;

  const _count = count && count > overflowCount ? `${overflowCount}+` : `${count}`;
  const showBadge = count !== 0 || (count === 0 && !!showZero);

  return {
    props: {
      dot: !!dot,
      overflowCount,
      ...rest,
    },
    state: {
      displayCount: _count,
      showBadge,
    },
  };
};
