import type { BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeProps => {
  if (!props) return {};
  const { iconPosition = 'before', size = 'medium', ...rest } = props;

  return {
    iconPosition: iconPosition,
    size,
    ...rest,
  };
};
