import { renderSimpleNav_unstable } from './renderSimpleNav';
import type { SimpleNavProps } from './simple-nav.types';
import { useSimpleNav_unstable } from './useSimpleNav';
import { useSimpleNavStyles_unstable } from './useSimpleNavStyles';

export const SimpleNav = (props: SimpleNavProps) => {
  const state = useSimpleNav_unstable(props);
  useSimpleNavStyles_unstable(state);
  return renderSimpleNav_unstable(state);
};
SimpleNav.displayName = 'SimpleNav';
