import { BadgeProps } from './Badge.types';

export const useBadge = (props: BadgeProps): BadgeProps => {
  if (!props) return {};
  const { iconPosition = 'before', size = 'medium', shadow, appearance, ...rest } = props;
  const showShadow = !!shadow && (!appearance || appearance === 'filled' || appearance === 'tint');

  return {
    iconPosition: iconPosition,
    size,
    shadow: showShadow,
    ...rest,
  };
};
