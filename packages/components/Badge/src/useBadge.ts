import type { BadgeInfo, BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeInfo => {
  if (!props) return { props: {}, state: {} };
  const { iconPosition = 'before', size = 'medium', ...rest } = props;

  return {
    props: {
      iconPosition: iconPosition,
      size,
      ...rest,
    },
    state: {},
  };
};
