import * as React from 'react';
import { View } from 'react-native';

import { Badge } from '../Badge/Badge';
import type { CounterBadgeProps } from './CounterBadge.types';

export function getCounterBadgeContent(
  count: number,
  overflowCount: number,
  children: React.ReactNode,
): React.ReactNode {
  if (React.Children.toArray(children).length > 0) {
    return children;
  }
  return count > overflowCount ? `${overflowCount}+` : `${count}`;
}

export const CounterBadge = React.forwardRef<React.ElementRef<typeof View>, CounterBadgeProps>((props, ref) => {
  const {
    appearance = 'filled',
    children,
    color = 'brand',
    count = 0,
    dot = false,
    overflowCount = 99,
    shape = 'circular',
    showZero = false,
    size = 'medium',
    ...rest
  } = props;
  const hasCustomContent = React.Children.toArray(children).length > 0;

  if (!dot && count === 0 && !showZero && !hasCustomContent) {
    return null;
  }

  return (
    <Badge
      {...rest}
      appearance={appearance}
      color={color}
      ref={ref}
      shape={shape}
      size={dot ? 'tiny' : size}
    >
      {dot ? null : getCounterBadgeContent(count, overflowCount, children)}
    </Badge>
  );
});

CounterBadge.displayName = 'CounterBadge';
