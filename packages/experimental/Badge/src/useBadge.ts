import { BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeProps => {
  const { iconPosition, ...rest } = props;

  return {
    iconPosition: iconPosition || 'before',
    ...rest,
  };
};
